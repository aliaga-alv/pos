import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/financial - Get financial report with revenue, expenses, and profit
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

    // Get completed orders (revenue) in date range
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
      select: {
        id: true,
        total: true,
        subtotal: true,
        tax: true,
        createdAt: true,
      },
    })

    // Get stock transactions (expenses) in date range
    const stockTransactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        type: {
          in: ['PURCHASE'], // Only purchases are actual expenses
        },
        totalCost: {
          not: null,
        },
      },
      select: {
        id: true,
        type: true,
        totalCost: true,
        createdAt: true,
        ingredient: {
          select: {
            name: true,
          },
        },
      },
    })

    // Calculate revenue metrics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    )
    const totalOrders = orders.length

    // Calculate expense metrics
    const totalExpenses = stockTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.totalCost || 0),
      0
    )
    const totalPurchases = stockTransactions.length

    // Calculate profit
    const grossProfit = totalRevenue - totalExpenses
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    // Daily breakdown for charts
    const dailyBreakdown: Record<
      string,
      {
        revenue: number
        expenses: number
        profit: number
        orders: number
        purchases: number
      }
    > = {}

    // Populate with revenue
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          revenue: 0,
          expenses: 0,
          profit: 0,
          orders: 0,
          purchases: 0,
        }
      }
      dailyBreakdown[date].revenue += Number(order.total)
      dailyBreakdown[date].orders += 1
    })

    // Populate with expenses
    stockTransactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          revenue: 0,
          expenses: 0,
          profit: 0,
          orders: 0,
          purchases: 0,
        }
      }
      dailyBreakdown[date].expenses += Number(transaction.totalCost || 0)
      dailyBreakdown[date].purchases += 1
    })

    // Calculate daily profit
    Object.keys(dailyBreakdown).forEach((date) => {
      dailyBreakdown[date].profit =
        dailyBreakdown[date].revenue - dailyBreakdown[date].expenses
    })

    // Expense breakdown by type
    const expenseBreakdown = stockTransactions.reduce((acc, transaction) => {
      const type = transaction.type
      if (!acc[type]) {
        acc[type] = 0
      }
      acc[type] += Number(transaction.totalCost || 0)
      return acc
    }, {} as Record<string, number>)

    // Top expenses (most expensive purchases)
    const topExpenses = stockTransactions
      .map((t) => ({
        ingredient: t.ingredient.name,
        amount: Number(t.totalCost || 0),
        date: t.createdAt,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    return NextResponse.json({
      period,
      startDate: start,
      endDate: end,
      summary: {
        totalRevenue,
        totalExpenses,
        grossProfit,
        profitMargin,
        totalOrders,
        totalPurchases,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        averagePurchaseValue:
          totalPurchases > 0 ? totalExpenses / totalPurchases : 0,
      },
      dailyBreakdown: Object.entries(dailyBreakdown)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      expenseBreakdown,
      topExpenses,
    })
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial report' },
      { status: 500 }
    )
  }
}
