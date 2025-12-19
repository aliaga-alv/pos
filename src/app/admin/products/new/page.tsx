'use client'

import { useRouter } from 'next/navigation'
import { useCreateProduct } from '@/hooks/use-products'
import { ProductForm } from '@/components/admin/products/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { ProductFormData } from '@/lib/validations/product'

export default function NewProductPage() {
  const router = useRouter()
  const createMutation = useCreateProduct()

  const handleSubmit = async (data: ProductFormData) => {
    await createMutation.mutateAsync(data)
    router.push('/admin/products')
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
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your menu
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
