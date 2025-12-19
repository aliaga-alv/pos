import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrderSchema, updateOrderStatusSchema } from '@/lib/validations/order'
import { createClient } from '@/lib/supabase/server'

// GET /api/orders - List orders with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const tableId = searchParams.get('tableId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (tableId) {
      where.tableId = tableId
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          table: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isPublicOrder, ...orderData } = body
    
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Allow public orders from customer menu (no auth required)
    // But require auth for POS orders
    if (!session && !isPublicOrder) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validatedData = createOrderSchema.parse(orderData)

    // Validate table for TABLE orders
    if (validatedData.type === 'TABLE' && !validatedData.tableId) {
      return NextResponse.json(
        { error: 'Table ID is required for table orders' },
        { status: 400 }
      )
    }

    // Fetch product prices from database to prevent price manipulation
    const productIds = validatedData.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, available: true },
    })

    // Verify all products exist and are available
    const productMap = new Map(products.map(p => [p.id, p]))
    for (const item of validatedData.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }
      if (!product.available) {
        return NextResponse.json(
          { error: `Product ${item.productId} is not available` },
          { status: 400 }
        )
      }
    }

    // Calculate totals using actual product prices
    const subtotal = validatedData.items.reduce(
      (sum, item) => {
        const product = productMap.get(item.productId)!
        return sum + Number(product.price) * item.quantity
      },
      0
    )
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    // For public orders, find a system user or use a placeholder
    let userId = session?.user.id
    if (!userId) {
      // Find or create a system user for public orders
      let systemUser = await prisma.user.findFirst({
        where: { email: 'system@restaurant.com' },
      })
      
      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'system@restaurant.com',
            name: 'System',
            role: 'WAITER',
            active: true,
          },
        })
      }
      userId = systemUser.id
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        type: validatedData.type,
        tableId: validatedData.tableId,
        customerName: validatedData.customerName,
        status: 'PENDING',
        subtotal,
        tax,
        total,
        notes: validatedData.notes,
        userId,
        items: {
          create: validatedData.items.map((item) => {
            const product = productMap.get(item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price, // Use actual price from database
              notes: item.notes,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update table status if it's a table order
    if (validatedData.tableId) {
      await prisma.table.update({
        where: { id: validatedData.tableId },
        data: { status: 'OCCUPIED' },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
