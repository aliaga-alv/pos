'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useCustomerCartStore } from '@/store/customer-cart-store'

export function CartBadge() {
  const [itemCount, setItemCount] = useState(0)
  
  useEffect(() => {
    // Get initial count
    const items = useCustomerCartStore.getState().items
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0))
    
    // Subscribe to changes
    const unsubscribe = useCustomerCartStore.subscribe((state) => {
      setItemCount(state.items.reduce((sum, item) => sum + item.quantity, 0))
    })
    
    return unsubscribe
  }, [])
  
  if (itemCount === 0) return null
  
  return (
    <Badge 
      variant="destructive" 
      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {itemCount}
    </Badge>
  )
}
