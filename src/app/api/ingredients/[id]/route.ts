import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ingredientSchema } from '@/lib/validations/ingredient'
import { createClient } from '@/lib/supabase/server'

// GET /api/ingredients/[id] - Get single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ingredient)
  } catch (error) {
    const { id } = await params
    console.error(`GET /api/ingredients/${id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredient' },
      { status: 500 }
    )
  }
}

// PUT /api/ingredients/[id] - Update ingredient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const validatedData = ingredientSchema.parse(body)

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(ingredient)
  } catch (error) {
    const { id } = await params
    console.error(`PUT /api/ingredients/${id} error:`, error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }

    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}

// DELETE /api/ingredients/[id] - Delete ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    // Check if ingredient is used in any products
    const productsUsing = await prisma.productIngredient.count({
      where: { ingredientId: id },
    })

    if (productsUsing > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete ingredient. It is used in ${productsUsing} product(s).`,
        },
        { status: 400 }
      )
    }

    await prisma.ingredient.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { id } = await params
    console.error(`DELETE /api/ingredients/${id} error:`, error)

    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    )
  }
}
