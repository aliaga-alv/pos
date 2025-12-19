import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/categories - List all active categories (public access)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/public/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
