'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { useCreateOrder } from '@/hooks/use-orders'
import { useCreatePayment } from '@/hooks/use-payments'
import { useTables } from '@/hooks/use-tables'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Table = {
  id: string
  number: number
  seats: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
}

const checkoutSchema = z.object({
  orderType: z.enum(['COUNTER', 'TABLE']),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD']),
  amountReceived: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, getTotal, clearCart } = useCartStore()
  const createOrder = useCreateOrder()
  const createPayment = useCreatePayment()
  const tables = useTables('AVAILABLE').data || []

  const subtotal = getTotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: 'COUNTER',
      paymentMethod: 'CASH',
      customerName: '',
      amountReceived: '',
      tableId: undefined,
    },
  })

  const orderType = form.watch('orderType')
  const paymentMethod = form.watch('paymentMethod')
  const amountReceived = form.watch('amountReceived')

  const receivedAmount = amountReceived ? parseFloat(amountReceived) : 0
  const change = receivedAmount - total

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Validate table for TABLE orders
      if (data.orderType === 'TABLE' && !data.tableId) {
        form.setError('tableId', { message: 'Please select a table' })
        return
      }

      // Validate cash payment for counter orders
      if (data.orderType === 'COUNTER' && data.paymentMethod === 'CASH' && (!data.amountReceived || receivedAmount < total)) {
        form.setError('amountReceived', { 
          message: 'Amount received must be greater than or equal to total' 
        })
        return
      }

      // Create order
      const order = await createOrder.mutateAsync({
        type: data.orderType,
        tableId: data.orderType === 'TABLE' ? data.tableId : undefined,
        customerName: data.customerName || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
      })

      // For counter orders, process payment immediately
      // For dine-in orders, send to kitchen first (pay later)
      if (data.orderType === 'COUNTER') {
        await createPayment.mutateAsync({
          orderId: order.id,
          method: data.paymentMethod,
          amount: total,
        })

        toast.success('Order completed successfully!')
        
        // Show change notification for cash payments
        if (data.paymentMethod === 'CASH' && change > 0) {
          toast.info(`Change: $${change.toFixed(2)}`)
        }
      } else {
        toast.success(`Order #${order.orderNumber} sent to kitchen!`)
      }

      clearCart()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete order'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Checkout</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Complete the order and process payment
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COUNTER">Counter Service</SelectItem>
                      <SelectItem value="TABLE">Dine In</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {orderType === 'TABLE' && (
              <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tables.map((table: Table) => (
                          <SelectItem key={table.id} value={table.id}>
                            Table {table.number} ({table.seats} seats)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {orderType === 'COUNTER' && (
              <>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentMethod === 'CASH' && (
                  <>
                    <FormField
                      control={form.control}
                      name="amountReceived"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Received</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {receivedAmount > 0 && (
                      <div className="flex justify-between text-sm font-medium">
                        <span>Change</span>
                        <span className={change < 0 ? 'text-destructive' : 'text-green-600'}>
                          ${Math.abs(change).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createOrder.isPending || createPayment.isPending}
              >
                {(createOrder.isPending || createPayment.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {orderType === 'COUNTER' ? 'Complete Order' : 'Send to Kitchen'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
