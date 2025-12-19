import { z } from 'zod'

export const tableSchema = z.object({
  number: z.number().int().positive('Table number must be positive'),
  seats: z.number().int().positive('Seats must be positive'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']),
})

export type TableFormData = z.infer<typeof tableSchema>
