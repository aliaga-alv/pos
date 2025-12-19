import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stockTransactionSchema } from '@/lib/validations/ingredient'
import { createClient } from '@/lib/supabase/server'

// POST /api/stock - Create stock transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = stockTransactionSchema.parse(body)

    // Get current ingredient
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: validatedData.ingredientId },
    })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    // Calculate new stock level
    let newStock = Number(ingredient.currentStock)
    const quantity = validatedData.quantity

    switch (validatedData.type) {
      case 'IN':
        newStock += Math.abs(quantity)
        break
      case 'OUT':
        newStock -= Math.abs(quantity)
        break
      case 'ADJUSTMENT':
        newStock = quantity
        break
    }

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    // Create transaction and update stock in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          ...validatedData,
          quantity: validatedData.type === 'ADJUSTMENT' ? quantity : Math.abs(quantity),
        },
      }),
      prisma.ingredient.update({
        where: { id: validatedData.ingredientId },
        data: { currentStock: newStock },
      }),
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('POST /api/stock error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create stock transaction' },
      { status: 500 }
    )
  }
}

// GET /api/stock - Get stock transaction history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const ingredientId = searchParams.get('ingredientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const where = ingredientId ? { ingredientId } : {}

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.stockTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/stock error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock transactions' },
      { status: 500 }
    )
  }
}
