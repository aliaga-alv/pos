'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUpdateOrderStatus } from '@/hooks/use-orders'
import { Clock, User, Hash, ChefHat, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type OrderItem = {
  id: string
  quantity: number
  notes?: string | null
  product: {
    id: string
    name: string
  }
}

type Order = {
  id: string
  orderNumber: number
  status: string
  type: string
  customerName?: string | null
  createdAt: string
  items: OrderItem[]
  table?: {
    number: number
  } | null
}

interface OrderCardProps {
  order: Order
}

const statusConfig = {
  PENDING: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending',
  },
  PREPARING: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Preparing',
  },
  READY: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Ready',
  },
  COMPLETED: {
    color: 'bg-slate-500',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    label: 'Completed',
  },
}

export function OrderCard({ order }: OrderCardProps) {
  const updateStatus = useUpdateOrderStatus()
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: newStatus,
      })
      toast.success(`Order #${order.orderNumber} marked as ${newStatus.toLowerCase()}`)
    } catch {
      toast.error('Failed to update order status')
    }
  }

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })

  return (
    <Card className={`${config.borderColor} border-2 ${config.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {order.orderNumber}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
          <Badge className={`${config.color} text-white`}>
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm pt-2">
          {order.table && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">Table {order.table.number}</span>
            </div>
          )}
          {order.type === 'COUNTER' && (
            <Badge variant="outline">Takeout</Badge>
          )}
          {order.customerName && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              {order.customerName}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="bg-white rounded p-2 border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-bold">
                      {item.quantity}x
                    </Badge>
                    <span className="font-medium">{item.product.name}</span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {order.status === 'PENDING' && (
            <Button
              className="w-full"
              onClick={() => handleStatusUpdate('PREPARING')}
              disabled={updateStatus.isPending}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Start Preparing
            </Button>
          )}
          {order.status === 'PREPARING' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusUpdate('READY')}
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Ready
            </Button>
          )}
          {order.status === 'READY' && (
            <div className="text-center py-2 text-green-700 font-semibold">
              ✓ Ready for Pickup
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
