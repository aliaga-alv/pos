import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Ingredient {
  id: string
  name: string
  unit: 'KILOGRAM' | 'GRAM' | 'LITER' | 'MILLILITER' | 'PIECE'
  currentStock: number
  minStock: number
  costPerUnit: number
  createdAt: string
  updatedAt: string
}

export interface IngredientInput {
  name: string
  unit: 'KILOGRAM' | 'GRAM' | 'LITER' | 'MILLILITER' | 'PIECE'
  currentStock: number
  minStock: number
  costPerUnit: number
}

interface IngredientsResponse {
  ingredients: Ingredient[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Fetch ingredients with pagination and search
export const useIngredients = (page = 1, limit = 50, search = '') => {
  return useQuery<IngredientsResponse>({
    queryKey: ['ingredients', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })
      const res = await fetch(`/api/ingredients?${params}`)
      if (!res.ok) throw new Error('Failed to fetch ingredients')
      return res.json()
    },
  })
}

// Fetch single ingredient
export const useIngredient = (id: string) => {
  return useQuery<Ingredient>({
    queryKey: ['ingredients', id],
    queryFn: async () => {
      const res = await fetch(`/api/ingredients/${id}`)
      if (!res.ok) throw new Error('Failed to fetch ingredient')
      return res.json()
    },
    enabled: !!id,
  })
}

// Create ingredient
export const useCreateIngredient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IngredientInput) => {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create ingredient')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update ingredient
export const useUpdateIngredient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IngredientInput }) => {
      const res = await fetch(`/api/ingredients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update ingredient')
      }
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients', id] })
      toast.success('Ingredient updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete ingredient
export const useDeleteIngredient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete ingredient')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
