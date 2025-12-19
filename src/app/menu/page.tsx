import { MenuGrid } from '@/components/menu/menu-grid'
import { CategoryFilter } from '@/components/menu/category-filter'

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

      {/* Category Filter */}
      <CategoryFilter />

      {/* Products Grid */}
      <MenuGrid />
    </div>
  )
}
