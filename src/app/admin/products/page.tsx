'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts, useDeleteProduct } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  available: boolean
  category: {
    name: string
  }
  ingredients?: Array<{
    id: string
    quantity: number
    ingredient: {
      name: string
      unit: string
    }
  }>
}

const ProductTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Ingredients</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
})

ProductTableHeader.displayName = 'ProductTableHeader'

const ProductFilters = memo(
  ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    categories,
  }: {
    searchQuery: string
    onSearchChange: (value: string) => void
    categoryFilter: string
    onCategoryChange: (value: string) => void
    categories: Array<{ id: string; name: string }>
  }) => {
    return (
      <div className="flex gap-4 mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
)

ProductFilters.displayName = 'ProductFilters'
const ProductList = memo(({ 
  products, 
  onEdit, 
  onDelete,
  isLoading
}: {
  products: Product[]
  onEdit: (id: string) => void
  onDelete: (product: Product) => void
  isLoading: boolean
}) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell
          colSpan={6}
          className="text-center text-muted-foreground"
        >
          Loading products...
        </TableCell>
      </TableRow>
    )
  }

  if (products.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={6}
          className="text-center text-muted-foreground"
        >
          No products found. Create your first product to get started.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {products.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
})

ProductList.displayName = 'ProductList'
const ProductRow = memo(
  ({
    product,
    onEdit,
    onDelete,
  }: {
    product: Product
    onEdit: (id: string) => void
    onDelete: (product: Product) => void
  }) => {
    return (
      <TableRow>
        <TableCell className="font-medium">{product.name}</TableCell>
        <TableCell>{product.category.name}</TableCell>
        <TableCell>${Number(product.price).toFixed(2)}</TableCell>
        <TableCell>{product.ingredients?.length || 0} items</TableCell>
        <TableCell>
          <Badge variant={product.available ? 'default' : 'secondary'}>
            {product.available ? 'Available' : 'Unavailable'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(product)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }
)

ProductRow.displayName = 'ProductRow'

export default function ProductsPage() {
  const router = useRouter()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []

  const { data, isLoading } = useProducts({
    categoryId: categoryFilter === 'all' ? '' : categoryFilter,
    search: debouncedSearch,
    includeInactive: true,
  })
  const products = data?.products || []

  const deleteMutation = useDeleteProduct()

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/admin/products/${id}`)
    },
    [router]
  )

  const handleDeleteClick = useCallback((product: Product) => {
    setDeletingProduct(product)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value)
  }, [])

  const handleDelete = useCallback(async () => {
    if (deletingProduct) {
      await deleteMutation.mutateAsync(deletingProduct.id)
      setDeletingProduct(null)
    }
  }, [deletingProduct, deleteMutation])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your menu items and recipes
          </p>
        </div>
        <Button onClick={() => router.push('/admin/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <ProductFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <ProductTableHeader />
            <TableBody>
              <ProductList
                products={products}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;
              {deletingProduct?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
