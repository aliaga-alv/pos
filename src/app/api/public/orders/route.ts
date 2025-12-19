import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPublicOrderSchema } from '@/lib/validations/order'

// POST /api/public/orders - Create order from customer menu (public access)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPublicOrderSchema.parse(body)

    // Validate table for TABLE orders
    if (validatedData.type === 'TABLE' && !validatedData.tableId) {
      return NextResponse.json(
        { error: 'Table ID is required for table orders' },
        { status: 400 }
      )
    }

    // Fetch product prices from database to prevent price manipulation
    const productIds = validatedData.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, available: true },
    })

    // Verify all products exist and are available
    const productMap = new Map(products.map((p) => [p.id, p]))
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
    const subtotal = validatedData.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!
      return sum + Number(product.price) * item.quantity
    }, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

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
        userId: systemUser.id,
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
    console.error('POST /api/public/orders error:', error)

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

// GET /api/public/orders/[id] - Get order status (public access)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderId = url.pathname.split('/').pop()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        table: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('GET /api/public/orders/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
