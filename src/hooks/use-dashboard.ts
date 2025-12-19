import { useQuery } from '@tanstack/react-query'

export interface DashboardData {
  today: {
    revenue: number
    orders: number
    activeOrders: number
    averageOrderValue: number
  }
  week: {
    revenue: number
    orders: number
  }
  month: {
    revenue: number
    orders: number
  }
  inventory: {
    lowStockCount: number
    outOfStockCount: number
    lowStockItems: {
      id: string
      name: string
      currentStock: number
      minStock: number
      unit: string
    }[]
  }
  recentOrders: {
    id: string
    orderNumber: number
    type: 'COUNTER' | 'TABLE'
    status: string
    total: number
    tableNumber?: number
    itemCount: number
    createdAt: string
  }[]
  salesChart: {
    date: string
    revenue: number
    orders: number
  }[]
  topProducts: {
    productId: string
    name: string
    image?: string | null
    quantity: number
    revenue: number
  }[]
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
