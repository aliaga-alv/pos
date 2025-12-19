'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useProduct, useUpdateProduct } from '@/hooks/use-products'
import { ProductForm } from '@/components/admin/products/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { ProductFormData } from '@/lib/validations/product'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: product, isLoading } = useProduct(id)
  const updateMutation = useUpdateProduct()

  const handleSubmit = async (data: ProductFormData) => {
    await updateMutation.mutateAsync({ id, data })
    router.push('/admin/products')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Product not found</div>
      </div>
    )
  }

  const defaultValues: ProductFormData = {
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    categoryId: product.categoryId,
    imageUrl: product.imageUrl || '',
    available: product.available,
    ingredients: product.ingredients?.map((pi) => ({
      ingredientId: pi.ingredient.id,
      quantity: Number(pi.quantity),
    })) || [],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product information and recipe
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Modify the information below to update the product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
