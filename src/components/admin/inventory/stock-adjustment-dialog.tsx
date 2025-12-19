'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateStockTransaction } from '@/hooks/use-stock'
import { stockTransactionSchema, type StockTransactionInput } from '@/lib/validations/ingredient'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package } from 'lucide-react'

const UNIT_LABELS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  MILLILITER: 'mL',
  PIECE: 'pcs',
}

interface StockAdjustmentDialogProps {
  ingredient: {
    id: string
    name: string
    unit: keyof typeof UNIT_LABELS
    currentStock: number
  }
}

export default function StockAdjustmentDialog({ ingredient }: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false)
  const createTransaction = useCreateStockTransaction()

  const form = useForm<StockTransactionInput>({
    resolver: zodResolver(stockTransactionSchema),
    defaultValues: {
      ingredientId: ingredient.id,
      type: 'IN',
      quantity: 0,
      notes: '',
    },
  })

  const onSubmit = (data: StockTransactionInput) => {
    createTransaction.mutate(data, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const transactionType = form.watch('type')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock: {ingredient.name}</DialogTitle>
          <DialogDescription>
            Current stock: {Number(ingredient.currentStock).toFixed(2)} {UNIT_LABELS[ingredient.unit]}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN">Stock In (Add)</SelectItem>
                      <SelectItem value="OUT">Stock Out (Remove)</SelectItem>
                      <SelectItem value="ADJUSTMENT">Adjustment (Set exact)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {transactionType === 'ADJUSTMENT' ? 'New Stock Level' : 'Quantity'}
                  </FormLabel>
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
                    {transactionType === 'IN' && `Add to current stock (${Number(ingredient.currentStock).toFixed(2)} ${UNIT_LABELS[ingredient.unit]})`}
                    {transactionType === 'OUT' && `Remove from current stock (${Number(ingredient.currentStock).toFixed(2)} ${UNIT_LABELS[ingredient.unit]})`}
                    {transactionType === 'ADJUSTMENT' && `Set stock to this exact value`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Received delivery, damaged items, inventory count"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
