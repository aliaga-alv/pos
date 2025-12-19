import { useQuery } from '@tanstack/react-query'

interface SalesReport {
  period: string
  startDate: Date
  endDate: Date
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
  }
  paymentBreakdown: Record<string, number>
  typeBreakdown: Record<string, number>
  dailyBreakdown: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

interface PopularItemsReport {
  startDate: Date
  endDate: Date
  popularItems: Array<{
    productId: string
    productName: string
    category: string
    quantitySold: number
    revenue: number
    orderCount: number
  }>
  categoryBreakdown: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  totalItemsSold: number
}

interface InventoryReport {
  summary: {
    totalItems: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    overstockedCount: number
  }
  lowStockItems: Array<{
    id: string
    name: string
    currentStock: number
    minStock: number
    unit: string
    shortage: number
  }>
  outOfStockItems: Array<{
    id: string
    name: string
    unit: string
    minStock: number
  }>
  topValueItems: Array<{
    id: string
    name: string
    currentStock: number
    unit: string
    costPerUnit: number
    totalValue: number
  }>
  recentTransactions: Array<{
    id: string
    type: string
    ingredient: string
    quantity: number
    unit: string
    totalCost: number | null
    notes: string | null
    user: string
    createdAt: Date
  }>
}

export function useSalesReport(params: {
  period?: string
  startDate?: string
  endDate?: string
}) {
  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString()

  return useQuery<SalesReport>({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => {
      const res = await fetch(`/api/reports/sales?${queryString}`)
      if (!res.ok) throw new Error('Failed to fetch sales report')
      return res.json()
    },
  })
}

export function usePopularItemsReport(params?: {
  limit?: number
  startDate?: string
  endDate?: string
}) {
  const queryString = params
    ? new URLSearchParams(params as Record<string, string>).toString()
    : ''

  return useQuery<PopularItemsReport>({
    queryKey: ['reports', 'popular', params],
    queryFn: async () => {
      const res = await fetch(`/api/reports/popular?${queryString}`)
      if (!res.ok) throw new Error('Failed to fetch popular items report')
      return res.json()
    },
  })
}

export function useInventoryReport() {
  return useQuery<InventoryReport>({
    queryKey: ['reports', 'inventory'],
    queryFn: async () => {
      const res = await fetch('/api/reports/inventory')
      if (!res.ok) throw new Error('Failed to fetch inventory report')
      return res.json()
    },
  })
}

interface FinancialReport {
  period: string
  startDate: Date
  endDate: Date
  summary: {
    totalRevenue: number
    totalExpenses: number
    grossProfit: number
    profitMargin: number
    totalOrders: number
    totalPurchases: number
    averageOrderValue: number
    averagePurchaseValue: number
  }
  dailyBreakdown: Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
    orders: number
    purchases: number
  }>
  expenseBreakdown: Record<string, number>
  topExpenses: Array<{
    ingredient: string
    amount: number
    date: Date
  }>
}

export function useFinancialReport(params: {
  period?: string
  startDate?: string
  endDate?: string
}) {
  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString()

  return useQuery<FinancialReport>({
    queryKey: ['reports', 'financial', params],
    queryFn: async () => {
      const res = await fetch(`/api/reports/financial?${queryString}`)
      if (!res.ok) throw new Error('Failed to fetch financial report')
      return res.json()
    },
  })
}
