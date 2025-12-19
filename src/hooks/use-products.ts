import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  available: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  ingredients?: Array<{
    id: string
    quantity: number
    ingredient: {
      id: string
      name: string
      unit: string
    }
  }>
}

type ProductFilters = {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  includeInactive?: boolean
}

type CreateProductData = {
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
  available: boolean
  ingredients?: Array<{
    ingredientId: string
    quantity: number
  }>
}

type UpdateProductData = CreateProductData

export function useProducts(filters: ProductFilters = {}) {
  const { page = 1, limit = 50, categoryId, search, includeInactive } = filters

  return useQuery({
    queryKey: ['products', page, limit, categoryId, search, includeInactive],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (categoryId) params.set('categoryId', categoryId)
      if (search) params.set('search', search)
      if (includeInactive) params.set('includeInactive', 'true')
      
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json() as Promise<{
        products: Product[]
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

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      return res.json() as Promise<Product>
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create product')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductData }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update product')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      toast.success('Product updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete product')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
