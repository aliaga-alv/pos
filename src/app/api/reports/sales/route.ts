import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/sales - Get sales report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range based on period
    let start: Date
    let end: Date = new Date()

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      const now = new Date()
      switch (period) {
        case 'daily':
          start = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'weekly':
          start = new Date(now.setDate(now.getDate() - 7))
          break
        case 'monthly':
          start = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          start = new Date(now.setHours(0, 0, 0, 0))
      }
    }

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['READY', 'COMPLETED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Payment method breakdown
    const paymentBreakdown = orders.reduce(
      (acc, order) => {
        if (order.payment) {
          const method = order.payment.method
          acc[method] = (acc[method] || 0) + Number(order.payment.amount)
        }
        return acc
      },
      {} as Record<string, number>
    )

    // Order type breakdown
    const typeBreakdown = orders.reduce(
      (acc, order) => {
        acc[order.type] = (acc[order.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Daily breakdown for charts
    const dailyBreakdown: Record<string, { revenue: number; orders: number }> = {}
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { revenue: 0, orders: 0 }
      }
      dailyBreakdown[date].revenue += Number(order.total)
      dailyBreakdown[date].orders += 1
    })

    return NextResponse.json({
      period,
      startDate: start,
      endDate: end,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
      paymentBreakdown,
      typeBreakdown,
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
        date,
        ...data,
      })),
    })
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales report' },
      { status: 500 }
    )
  }
}
