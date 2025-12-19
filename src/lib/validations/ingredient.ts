import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  unit: z.enum(['KILOGRAM', 'GRAM', 'LITER', 'MILLILITER', 'PIECE'], {
    required_error: 'Unit is required',
  }),
  currentStock: z.number().min(0, 'Stock cannot be negative'),
  minStock: z.number().min(0, 'Minimum stock cannot be negative'),
  costPerUnit: z.number().min(0, 'Cost cannot be negative'),
})

export const stockTransactionSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: 'Transaction type is required',
  }),
  quantity: z.number().refine((val) => val !== 0, {
    message: 'Quantity cannot be zero',
  }),
  notes: z.string().max(500).optional(),
})

export type IngredientInput = z.infer<typeof ingredientSchema>
export type StockTransactionInput = z.infer<typeof stockTransactionSchema>
