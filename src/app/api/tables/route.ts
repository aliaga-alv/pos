import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tableSchema } from '@/lib/validations/table'
import { createClient } from '@/lib/supabase/server'

// GET /api/tables - List all tables
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''

    const where = status ? { status: status as any } : {}

    const tables = await prisma.table.findMany({
      where,
      orderBy: {
        number: 'asc',
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('GET /api/tables error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

// POST /api/tables - Create new table
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
    const validatedData = tableSchema.parse(body)

    // Check if table number already exists
    const existing = await prisma.table.findUnique({
      where: { number: validatedData.number },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 400 }
      )
    }

    const table = await prisma.table.create({
      data: validatedData,
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('POST /api/tables error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}
