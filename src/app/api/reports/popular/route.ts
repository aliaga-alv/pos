import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/popular - Get popular items report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    const start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    // Get order items with product info
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: {
            in: ['READY', 'COMPLETED'],
          },
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    // Aggregate by product
    const productStats = orderItems.reduce((acc, item) => {
      const productId = item.productId
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: item.product.name,
          category: item.product.category.name,
          quantitySold: 0,
          revenue: 0,
          orderCount: 0,
        }
      }
      acc[productId].quantitySold += item.quantity
      acc[productId].revenue += Number(item.price) * item.quantity
      acc[productId].orderCount += 1
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by quantity sold
    const popularItems = Object.values(productStats)
      .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
      .slice(0, limit)

    // Calculate category breakdown
    const categoryBreakdown = orderItems.reduce((acc, item) => {
      const category = item.product.category.name
      if (!acc[category]) {
        acc[category] = {
          name: category,
          quantity: 0,
          revenue: 0,
        }
      }
      acc[category].quantity += item.quantity
      acc[category].revenue += Number(item.price) * item.quantity
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      startDate: start,
      endDate: end,
      popularItems,
      categoryBreakdown: Object.values(categoryBreakdown).sort(
        (a: any, b: any) => b.revenue - a.revenue
      ),
      totalItemsSold: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error('Error fetching popular items report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular items report' },
      { status: 500 }
    )
  }
}
