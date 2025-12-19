'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { useCategories } from '@/hooks/use-categories'
import { useIngredients } from '@/hooks/use-ingredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductFormProps = {
  defaultValues?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
  isSubmitting: boolean
}

export function ProductForm({ defaultValues, onSubmit, isSubmitting }: ProductFormProps) {
  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []
  
  const { data: ingredientsData } = useIngredients()
  const ingredients = ingredientsData?.ingredients || []

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      imageUrl: '',
      available: true,
      ingredients: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  })

  const handleSubmit = form.handleSubmit(async (data: ProductFormData) => {
    await onSubmit(data)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="e.g., Margherita Pizza"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe your product..."
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            value={form.watch('categoryId')}
            onValueChange={(value) => form.setValue('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            {...form.register('imageUrl')}
            placeholder="https://example.com/image.jpg"
          />
          {form.formState.errors.imageUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.imageUrl.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="available"
          {...form.register('available')}
          className="h-4 w-4"
        />
        <Label htmlFor="available" className="cursor-pointer">
          Available for sale
        </Label>
      </div>

      {/* Recipe Builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recipe (Ingredients)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ingredientId: '', quantity: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ingredients added yet. Click &quot;Add Ingredient&quot; to start building the recipe.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Select
                      value={form.watch(`ingredients.${index}.ingredientId`)}
                      onValueChange={(value) =>
                        form.setValue(`ingredients.${index}.ingredientId`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.ingredients?.[index]?.ingredientId && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.ingredients[index]?.ingredientId?.message}
                      </p>
                    )}
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.001"
                      {...form.register(`ingredients.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Qty"
                    />
                    {form.formState.errors.ingredients?.[index]?.quantity && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.ingredients[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
