'use client'

import { usePublicCategories } from '@/hooks/use-public-menu'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')

  const { data: categories, isLoading } = usePublicCategories()

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/menu?category=${categoryId}`)
    } else {
      router.push('/menu')
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0" />
        ))}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => handleCategoryClick(null)}
        className="shrink-0"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => handleCategoryClick(category.id)}
          className="shrink-0"
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
