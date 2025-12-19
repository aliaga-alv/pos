'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
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
import { useCreatePayment } from '@/hooks/use-payments'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const paymentFormSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD']),
  amountReceived: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentDialogProps {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDialog({ order, open, onOpenChange }: PaymentDialogProps) {
  const createPayment = useCreatePayment()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: 'CASH',
      amountReceived: '',
    },
  })

  const paymentMethod = form.watch('paymentMethod')
  const amountReceived = form.watch('amountReceived')

  const total = order ? Number(order.total) : 0
  const receivedAmount = amountReceived ? parseFloat(amountReceived) : 0
  const change = receivedAmount - total

  const onSubmit = async (data: PaymentFormData) => {
    if (!order) return

    try {
      // Validate cash payment
      if (data.paymentMethod === 'CASH' && (!data.amountReceived || receivedAmount < total)) {
        form.setError('amountReceived', {
          message: 'Amount received must be greater than or equal to total',
        })
        return
      }

      await createPayment.mutateAsync({
        orderId: order.id,
        method: data.paymentMethod,
        amount: total,
      })

      toast.success('Payment processed successfully!')

      // Show change notification for cash payments
      if (data.paymentMethod === 'CASH' && change > 0) {
        toast.info(`Change: $${change.toFixed(2)}`)
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process payment'
      toast.error(message)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Order #{order.orderNumber}
            {order.table && ` - Table ${order.table.number}`}
          </p>
        </DialogHeader>

        <div className="border-t border-b py-4 my-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                disabled={createPayment.isPending}
              >
                {createPayment.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Complete Payment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
