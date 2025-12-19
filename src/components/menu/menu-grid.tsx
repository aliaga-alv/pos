'use client'

import { usePublicProducts } from '@/hooks/use-public-menu'
import { ProductCard } from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParams } from 'next/navigation'

export function MenuGrid() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const { data: products, isLoading } = usePublicProducts()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    )
  }

  const filteredProducts = categoryId
    ? products?.filter((p) => p.categoryId === categoryId && p.available)
    : products?.filter((p) => p.available)

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
