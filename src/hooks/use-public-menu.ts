import { useQuery } from '@tanstack/react-query'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  available: boolean
  category: {
    id: string
    name: string
  }
}

type Category = {
  id: string
  name: string
  order: number
  active: boolean
}

// Hook for public product listing (customer menu)
export function usePublicProducts() {
  return useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const res = await fetch('/api/public/products')
      if (!res.ok) {
        throw new Error('Failed to fetch products')
      }
      return res.json() as Promise<Product[]>
    },
  })
}

// Hook for public category listing (customer menu)
export function usePublicCategories() {
  return useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const res = await fetch('/api/public/categories')
      if (!res.ok) {
        throw new Error('Failed to fetch categories')
      }
      return res.json() as Promise<Category[]>
    },
  })
}
