'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderCard } from '@/components/kitchen/order-card'
import { Clock, ChefHat } from 'lucide-react'
import { UserMenuClient } from '@/components/layout/user-menu-client'
import { NavLinks } from '@/components/layout/nav-links'

export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'all'>(
    'pending'
  )

  // Fetch orders based on active tab
  const statusFilter = activeTab === 'all' ? '' : activeTab.toUpperCase()
  const { data: ordersData, isLoading } = useOrders({
    status: statusFilter,
  })

  const orders = ordersData?.orders || []

  // Count orders by status
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <ChefHat className="h-6 w-6 md:h-8 md:w-8" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Kitchen Display</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <span className="text-sm md:text-lg font-mono">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <NavLinks />
            </div>
            <UserMenuClient />
          </div>
        </div>
      </header>

      {/* Status Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as 'pending' | 'preparing' | 'all')
        }
        className="flex-1 flex flex-col"
      >
        <div className="bg-white border-b px-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="relative">
              Preparing
              {preparingCount > 0 && (
                <Badge className="ml-2">{preparingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>
        </div>

        {/* Order Grid */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders to display</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
