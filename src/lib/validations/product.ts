import { z } from 'zod'

export const productIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'Ingredient is required'),
  quantity: z.number().positive('Quantity must be positive'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  available: z.boolean(),
  ingredients: z.array(productIngredientSchema).optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
export type ProductIngredientInput = z.infer<typeof productIngredientSchema>
