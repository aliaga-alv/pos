'use client'

import { use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useIngredient, useUpdateIngredient } from '@/hooks/use-ingredients'
import { useStockTransactions } from '@/hooks/use-stock'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import StockAdjustmentDialog from '@/components/admin/inventory/stock-adjustment-dialog'

const UNIT_OPTIONS = [
  { value: 'KILOGRAM', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'LITER', label: 'Liter (L)' },
  { value: 'MILLILITER', label: 'Milliliter (mL)' },
  { value: 'PIECE', label: 'Piece (pcs)' },
] as const

const UNIT_LABELS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  MILLILITER: 'mL',
  PIECE: 'pcs',
}

const TRANSACTION_LABELS = {
  IN: 'Stock In',
  OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment',
}

export default function EditIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: ingredient, isLoading } = useIngredient(id)
  const { data: transactions } = useStockTransactions(id, 1, 10)
  const updateMutation = useUpdateIngredient()

  const form = useForm<IngredientInput>({
    resolver: zodResolver(ingredientSchema),
    values: ingredient ? {
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: Number(ingredient.currentStock),
      minStock: Number(ingredient.minStock),
      costPerUnit: Number(ingredient.costPerUnit),
    } : undefined,
  })

  const onSubmit = (data: IngredientInput) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        router.push('/admin/inventory')
      },
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!ingredient) {
    return <div className="text-center py-8">Ingredient not found</div>
  }

  const isLowStock = Number(ingredient.currentStock) <= Number(ingredient.minStock)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Edit Ingredient</h2>
          <p className="text-muted-foreground">
            Update ingredient details and manage stock
          </p>
        </div>
        <StockAdjustmentDialog ingredient={ingredient} />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stock Status</CardTitle>
                <CardDescription>Current inventory levels</CardDescription>
              </div>
              {isLowStock && (
                <Badge variant="destructive">Low Stock Alert</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Current Stock</div>
                <div className={`text-2xl font-bold ${isLowStock ? 'text-red-600' : ''}`}>
                  {Number(ingredient.currentStock).toFixed(2)} {UNIT_LABELS[ingredient.unit]}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Minimum Stock</div>
                <div className="text-2xl font-bold">
                  {Number(ingredient.minStock).toFixed(2)} {UNIT_LABELS[ingredient.unit]}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cost Per Unit</div>
                <div className="text-2xl font-bold">
                  ${Number(ingredient.costPerUnit).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingredient Details</CardTitle>
            <CardDescription>
              Update the information below to modify the ingredient
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled
                          />
                        </FormControl>
                        <FormDescription>
                          Use stock adjustment to change quantity
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
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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

        {transactions && transactions.transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Last 10 stock movements for this ingredient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === 'IN' ? 'default' :
                              transaction.type === 'OUT' ? 'destructive' : 'secondary'
                            }
                          >
                            {TRANSACTION_LABELS[transaction.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.type === 'OUT' && '-'}
                          {Number(transaction.quantity).toFixed(2)} {UNIT_LABELS[ingredient.unit]}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
