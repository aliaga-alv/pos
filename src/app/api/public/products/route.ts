import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/products - List all available products (public access)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        available: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
