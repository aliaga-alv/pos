import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CreatePaymentData = {
  orderId: string
  method: 'CASH' | 'CARD'
  amount: number
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to process payment')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
      toast.success('Payment processed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
