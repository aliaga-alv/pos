'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Clock, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  notes: string | null
  product: {
    id: string
    name: string
    imageUrl: string | null
  }
}

interface Order {
  id: string
  orderNumber: number
  customerName: string | null
  status: string
  subtotal: number
  tax: number
  total: number
  createdAt: Date
  table: {
    number: number
  } | null
  items: OrderItem[]
}

interface OrderTrackerProps {
  order: Order
}

const statusConfig = {
  PENDING: {
    label: 'Order Received',
    description: 'Your order has been received and is waiting to be prepared',
    icon: Clock,
    color: 'bg-yellow-500',
  },
  PREPARING: {
    label: 'Preparing',
    description: 'Our kitchen is preparing your delicious meal',
    icon: UtensilsCrossed,
    color: 'bg-blue-500',
  },
  READY: {
    label: 'Ready',
    description: 'Your order is ready! A staff member will bring it to you shortly',
    icon: CheckCircle2,
    color: 'bg-green-500',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Thank you for your order! Enjoy your meal',
    icon: CheckCircle2,
    color: 'bg-green-600',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'This order has been cancelled',
    icon: Clock,
    color: 'bg-red-500',
  },
}

export function OrderTracker({ order: initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh order status every 10 seconds if not completed
  useEffect(() => {
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return
    }

    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(`/api/orders/${order.id}`)
        if (response.ok) {
          const updatedOrder = await response.json()
          setOrder(updatedOrder)
        }
      } catch (error) {
        console.error('Failed to refresh order:', error)
      } finally {
        setIsRefreshing(false)
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [order.id, order.status])

  const config = statusConfig[order.status as keyof typeof statusConfig]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/menu">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </Link>

      {/* Order Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              {order.table && (
                <p className="text-sm text-muted-foreground mt-1">
                  Table {order.table.number}
                </p>
              )}
            </div>
            <Badge className={`${config.color} text-white text-sm px-3 py-1`}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon and Description */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className={`${config.color} rounded-full p-3 text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{config.label}</h3>
              <p className="text-muted-foreground">{config.description}</p>
              {isRefreshing && (
                <p className="text-xs text-muted-foreground mt-2">Refreshing...</p>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between items-center px-4">
            {['PENDING', 'PREPARING', 'READY'].map((status, index) => {
              const isActive = 
                status === order.status ||
                (['PREPARING', 'READY', 'COMPLETED'].includes(order.status) && status === 'PENDING') ||
                (['READY', 'COMPLETED'].includes(order.status) && status === 'PREPARING')
              
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isActive ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {statusConfig[status as keyof typeof statusConfig].label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isActive && status !== order.status ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Order Details */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">Note: {item.notes}</p>
                    )}
                  </div>
                  <p className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Name */}
          {order.customerName && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                Order for: <span className="font-medium text-foreground">{order.customerName}</span>
              </div>
            </>
          )}

          {/* Order Time */}
          <div className="text-sm text-muted-foreground">
            Placed at: {new Date(order.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-center">
              💡 This page updates automatically. Keep it open to track your order status.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
