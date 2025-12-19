'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { Receipt } from '@/components/orders/receipt'

interface OrderDetailsDialogProps {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Order #{order.orderNumber}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge>{order.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Type</p>
              <p className="font-medium">{order.type === 'COUNTER' ? 'Counter Service' : 'Dine In'}</p>
            </div>
            {order.table && (
              <div>
                <p className="text-muted-foreground">Table</p>
                <p className="font-medium">Table {order.table.number}</p>
              </div>
            )}
            {order.customerName && (
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Server</p>
              <p className="font-medium">{order.user.name}</p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between p-2 bg-slate-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.quantity}x</Badge>
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          {order.payment && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Payment</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <Badge variant="secondary">{order.payment.method}</Badge>
                </div>
              </div>
            </>
          )}

          {/* Print Receipt */}
          <Separator />
          <div className="flex justify-end">
            <Receipt order={order} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
