import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  order: z.number().int().min(0),
  active: z.boolean(),
})

export type CategoryFormData = z.infer<typeof categorySchema>
