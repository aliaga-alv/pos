import { z } from 'zod'

export const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  method: z.enum(['CASH', 'CARD']),
  amount: z.number().positive('Amount must be positive'),
})

export type PaymentInput = z.infer<typeof paymentSchema>
