import { Suspense } from 'react'
import { MenuGrid } from '@/components/menu/menu-grid'
import { CategoryFilter } from '@/components/menu/category-filter'
import { Skeleton } from '@/components/ui/skeleton'

function MenuContent() {
  return (
    <>
      {/* Category Filter */}
      <CategoryFilter />

      {/* Products Grid */}
      <MenuGrid />
    </>
  )
}

export default function MenuPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Our Menu</h1>
        <p className="text-muted-foreground text-lg">
          Browse our delicious selection and add items to your cart
        </p>
      </div>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  )
}
