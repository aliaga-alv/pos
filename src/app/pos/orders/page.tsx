'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderDetailsDialog } from '@/components/pos/order-details-dialog'
import { PaymentDialog } from '@/components/pos/payment-dialog'
import { formatDistanceToNow } from 'date-fns'
import { Search, Clock, ChevronLeft } from 'lucide-react'
import { UserMenuClient } from '@/components/layout/user-menu-client'
import { NavLinks } from '@/components/layout/nav-links'

const statusConfig = {
  PENDING: { color: 'bg-yellow-500', label: 'Pending' },
  PREPARING: { color: 'bg-blue-500', label: 'Preparing' },
  READY: { color: 'bg-green-500', label: 'Ready' },
  COMPLETED: { color: 'bg-slate-500', label: 'Completed' },
  CANCELLED: { color: 'bg-red-500', label: 'Cancelled' },
}

export default function POSOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [paymentOrder, setPaymentOrder] = useState<any>(null)

  const { data: ordersData, isLoading } = useOrders({
    status: statusFilter === 'all' ? '' : statusFilter,
    type: typeFilter === 'all' ? '' : typeFilter,
  })

  const orders = ordersData?.orders || []

  // Filter by search query
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      order.orderNumber.toString().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.table?.number.toString().includes(searchLower)
    )
  })

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/pos">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </a>
            <div>
              <h1 className="text-2xl font-bold">Order History</h1>
              <p className="text-sm text-muted-foreground">
                View and manage all orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NavLinks />
            <UserMenuClient />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, customer, or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="COUNTER">Counter</SelectItem>
              <SelectItem value="TABLE">Dine In</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const config =
                statusConfig[order.status as keyof typeof statusConfig]
              const needsPayment = order.status === 'READY' && !order.payment

              return (
                <Card
                  key={order.id}
                  className={needsPayment ? 'border-green-500 border-2' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          {order.table && (
                            <span>Table {order.table.number}</span>
                          )}
                          {order.customerName && (
                            <span>{order.customerName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${config.color} text-white`}>
                          {config.label}
                        </Badge>
                        {order.type === 'COUNTER' && (
                          <Badge variant="outline">Takeout</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </p>
                        <p className="text-lg font-bold">
                          ${Number(order.total).toFixed(2)}
                        </p>
                        {order.payment && (
                          <Badge variant="secondary">
                            Paid - {order.payment.method}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                        {needsPayment && (
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setPaymentOrder(order)}
                          >
                            Process Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />

      <PaymentDialog
        order={paymentOrder}
        open={!!paymentOrder}
        onOpenChange={(open) => !open && setPaymentOrder(null)}
      />
    </div>
  )
}
