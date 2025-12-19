import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
} from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    // Get all ingredients for stock calculations
    const allIngredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        currentStock: true,
        minStock: true,
      },
    })

    const lowStockCount = allIngredients.filter(
      (i) => Number(i.currentStock) < Number(i.minStock)
    ).length
    const outOfStockCount = allIngredients.filter(
      (i) => Number(i.currentStock) <= 0
    ).length

    // Today's stats
    const [todayOrders, todayRevenue, activeOrders] = await Promise.all([
      // Today's order count
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: { not: 'CANCELLED' },
        },
      }),

      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),

      // Active orders (PENDING, PREPARING, READY)
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PREPARING', 'READY'] },
        },
      }),
    ])

    // Week comparison
    const [weekOrders, weekRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: weekStart },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: weekStart },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
    ])

    // Month comparison
    const [monthOrders, monthRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
    ])

    // Recent orders with details
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        table: { select: { number: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    })

    // Last 7 days sales for chart
    const last7Days = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        return prisma.order
          .aggregate({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd },
              status: { not: 'CANCELLED' },
            },
            _sum: { total: true },
            _count: true,
          })
          .then((result) => ({
            date: date.toISOString().split('T')[0],
            revenue: result._sum.total || 0,
            orders: result._count,
          }))
      })
    )

    // Top selling products today
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: { not: 'CANCELLED' },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 5,
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, imageUrl: true },
        })
        
        // Calculate revenue for this product
        const orderItems = await prisma.orderItem.findMany({
          where: {
            productId: item.productId,
            order: {
              createdAt: { gte: todayStart, lte: todayEnd },
              status: { not: 'CANCELLED' },
            },
          },
          select: {
            quantity: true,
            price: true,
          },
        })
        
        const revenue = orderItems.reduce(
          (sum, oi) => sum + Number(oi.price) * oi.quantity,
          0
        )
        
        return {
          productId: item.productId,
          name: product?.name || 'Unknown',
          image: product?.imageUrl,
          quantity: item._sum.quantity || 0,
          revenue,
        }
      })
    )

    // Low stock items
    const allIngredientsWithDetails = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
        minStock: true,
        unit: true
      }
    })

    const lowStockItems = allIngredientsWithDetails
      .filter(i => Number(i.currentStock) < Number(i.minStock))
      .sort((a, b) => Number(a.currentStock) - Number(b.currentStock))
      .slice(0, 5)

    return NextResponse.json({
      today: {
        revenue: todayRevenue._sum.total || 0,
        orders: todayOrders,
        activeOrders,
        averageOrderValue:
          todayOrders > 0 ? Number(todayRevenue._sum.total || 0) / todayOrders : 0,
      },
      week: {
        revenue: weekRevenue._sum.total || 0,
        orders: weekOrders,
      },
      month: {
        revenue: monthRevenue._sum.total || 0,
        orders: monthOrders,
      },
      inventory: {
        lowStockCount,
        outOfStockCount,
        lowStockItems,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        type: order.type,
        status: order.status,
        total: order.total,
        tableNumber: order.table?.number,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      salesChart: last7Days,
      topProducts: topProductsWithDetails,
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
