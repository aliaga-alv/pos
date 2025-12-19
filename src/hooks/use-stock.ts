import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface StockTransaction {
  id: string
  ingredientId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  notes?: string
  createdAt: string
  ingredient?: {
    id: string
    name: string
    unit: string
  }
}

export interface StockTransactionInput {
  ingredientId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  notes?: string
}

interface StockTransactionsResponse {
  transactions: StockTransaction[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Fetch stock transactions with optional ingredient filter
export const useStockTransactions = (ingredientId?: string, page = 1, limit = 20) => {
  return useQuery<StockTransactionsResponse>({
    queryKey: ['stock-transactions', ingredientId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(ingredientId && { ingredientId }),
      })
      const res = await fetch(`/api/stock?${params}`)
      if (!res.ok) throw new Error('Failed to fetch stock transactions')
      return res.json()
    },
  })
}

// Create stock transaction
export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StockTransactionInput) => {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create stock transaction')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients', variables.ingredientId] })
      toast.success('Stock updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
