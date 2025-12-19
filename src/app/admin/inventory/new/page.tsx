'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateIngredient } from '@/hooks/use-ingredients'
import { ingredientSchema, type IngredientInput } from '@/lib/validations/ingredient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const UNIT_OPTIONS = [
  { value: 'KILOGRAM', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'LITER', label: 'Liter (L)' },
  { value: 'MILLILITER', label: 'Milliliter (mL)' },
  { value: 'PIECE', label: 'Piece (pcs)' },
] as const

export default function NewIngredientPage() {
  const router = useRouter()
  const createMutation = useCreateIngredient()

  const form = useForm<IngredientInput>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      unit: 'KILOGRAM',
      currentStock: 0,
      minStock: 0,
      costPerUnit: 0,
    },
  })

  const onSubmit = (data: IngredientInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/admin/inventory')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Ingredient</h2>
          <p className="text-muted-foreground">
            Create a new ingredient for your inventory
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient Details</CardTitle>
          <CardDescription>
            Fill in the information below to add a new ingredient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tomatoes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onBlur={(e) => {
                            field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))
                            field.onBlur()
                          }}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>
                        Current quantity in stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onBlur={(e) => {
                            field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))
                            field.onBlur()
                          }}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>
                        Low stock alert threshold
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Per Unit ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))
                          field.onBlur()
                        }}
                        name={field.name}
                      />
                    </FormControl>
                    <FormDescription>
                      Purchase cost per unit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Ingredient'}
                </Button>
                <Link href="/admin/inventory">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
