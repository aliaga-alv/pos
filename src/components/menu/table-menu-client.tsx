'use client'

import { useEffect } from 'react'
import { useCustomerCartStore } from '@/store/customer-cart-store'
import { MenuGrid } from './menu-grid'
import { CategoryFilter } from './category-filter'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Table {
  id: string
  number: number
  seats: number
  status: string
}

interface TableMenuClientProps {
  table: Table
}

export function TableMenuClient({ table }: TableMenuClientProps) {
  const setTableId = useCustomerCartStore((state) => state.setTableId)

  useEffect(() => {
    // Set the table ID when the component mounts
    setTableId(table.id)
  }, [table.id, setTableId])

  return (
    <div className="space-y-6">
      {/* Table Info Card */}
      <Card className="bg-primary/5 border-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Table {table.number}</h2>
              <p className="text-muted-foreground">
                Seats: {table.seats} | Status:{' '}
                <Badge variant={table.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                  {table.status}
                </Badge>
              </p>
            </div>
            <div className="text-6xl">📍</div>
          </div>
          <p className="mt-3 text-sm">
            You&apos;re ordering for Table {table.number}. Add items to your cart and checkout when ready!
          </p>
        </CardContent>
      </Card>

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
