import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/inventory - Get inventory report
export async function GET() {
  try {
    // Get all ingredients with stock info
    const ingredients = await prisma.ingredient.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        currentStock: true,
        minStock: true,
        maxStock: true,
        costPerUnit: true,
        supplier: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Calculate metrics
    const totalValue = ingredients.reduce(
      (sum, ing) => sum + Number(ing.currentStock) * Number(ing.costPerUnit),
      0
    )

    // Low stock items (below minimum)
    const lowStockItems = ingredients.filter(
      (ing) => Number(ing.currentStock) < Number(ing.minStock)
    )

    // Out of stock items
    const outOfStockItems = ingredients.filter(
      (ing) => Number(ing.currentStock) === 0
    )

    // Overstocked items (above maximum if set)
    const overstockedItems = ingredients.filter(
      (ing) => ing.maxStock && Number(ing.currentStock) > Number(ing.maxStock)
    )

    // Stock by value (most expensive inventory)
    const topValueItems = ingredients
      .map((ing) => ({
        ...ing,
        totalValue: Number(ing.currentStock) * Number(ing.costPerUnit),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)

    // Get recent stock transactions
    const recentTransactions = await prisma.stockTransaction.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ingredient: {
          select: {
            name: true,
            unit: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      summary: {
        totalItems: ingredients.length,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        overstockedCount: overstockedItems.length,
      },
      lowStockItems: lowStockItems.map((ing) => ({
        id: ing.id,
        name: ing.name,
        currentStock: Number(ing.currentStock),
        minStock: Number(ing.minStock),
        unit: ing.unit,
        shortage: Number(ing.minStock) - Number(ing.currentStock),
      })),
      outOfStockItems: outOfStockItems.map((ing) => ({
        id: ing.id,
        name: ing.name,
        unit: ing.unit,
        minStock: Number(ing.minStock),
      })),
      topValueItems: topValueItems.map((ing) => ({
        id: ing.id,
        name: ing.name,
        currentStock: Number(ing.currentStock),
        unit: ing.unit,
        costPerUnit: Number(ing.costPerUnit),
        totalValue: ing.totalValue,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        ingredient: t.ingredient.name,
        quantity: Number(t.quantity),
        unit: t.ingredient.unit,
        totalCost: t.totalCost ? Number(t.totalCost) : null,
        notes: t.notes,
        user: t.user?.name || 'System',
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory report' },
      { status: 500 }
    )
  }
}
