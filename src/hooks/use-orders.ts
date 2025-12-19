import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type OrderItem = {
  id: string
  productId: string
  quantity: number
  price: number
  notes: string | null
  product: {
    id: string
    name: string
    price: number
  }
}

type Order = {
  id: string
  orderNumber: number
  type: 'COUNTER' | 'TABLE'
  tableId: string | null
  customerName: string | null
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  subtotal: number
  tax: number
  total: number
  notes: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  table?: {
    id: string
    number: number
  }
  user: {
    id: string
    name: string
    email: string
  }
  payment?: {
    id: string
    method: 'CASH' | 'CARD'
    amount: number
  }
}

type OrderFilters = {
  page?: number
  limit?: number
  status?: string
  type?: string
  tableId?: string
}

type CreateOrderData = {
  type: 'COUNTER' | 'TABLE'
  tableId?: string
  customerName?: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    notes?: string
  }>
  notes?: string
}

export function useOrders(filters: OrderFilters = {}) {
  const { page = 1, limit = 50, status, type, tableId } = filters

  return useQuery({
    queryKey: ['orders', page, limit, status, type, tableId],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (status) params.set('status', status)
      if (type) params.set('type', type)
      if (tableId) params.set('tableId', tableId)

      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json() as Promise<{
        orders: Order[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error('Failed to fetch order')
      return res.json() as Promise<Order>
    },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create order')
      }
      return res.json() as Promise<Order>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update order status')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
      toast.success('Order status updated')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
