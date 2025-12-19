import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  notes: z.string().optional(),
})

// Schema for public orders (price is fetched from database)
export const publicOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
})

export const createOrderSchema = z.object({
  type: z.enum(['COUNTER', 'TABLE']),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  notes: z.string().optional(),
})

export const createPublicOrderSchema = z.object({
  type: z.enum(['COUNTER', 'TABLE']),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(publicOrderItemSchema).min(1, 'Order must have at least one item'),
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
})

export type OrderItemInput = z.infer<typeof orderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type PublicOrderItemInput = z.infer<typeof publicOrderItemSchema>
export type CreatePublicOrderInput = z.infer<typeof createPublicOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
