'use client'

import { useState, useRef, useEffect } from 'react'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Search, Keyboard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { POSCart } from '@/components/pos/pos-cart'
import { CheckoutDialog } from '@/components/pos/checkout-dialog'
import { UserMenuClient } from '@/components/layout/user-menu-client'
import { NavLinks } from '@/components/layout/nav-links'
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/use-keyboard-shortcuts'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export default function PosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []
  
  const { data: productsData } = useProducts({
    categoryId: selectedCategory === 'all' ? '' : selectedCategory,
    search: searchQuery,
    includeInactive: false,
  })
  const products = productsData?.products || []
  
  const { addItem, items, getItemCount, clearCart } = useCartStore()

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    })
  }

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 'f',
      description: 'Focus search',
      action: () => searchInputRef.current?.focus(),
    },
    {
      key: 'c',
      description: 'Open checkout',
      action: () => items.length > 0 && setCheckoutOpen(true),
    },
    {
      key: 'Escape',
      description: 'Clear search',
      action: () => setSearchQuery(''),
    },
    {
      key: '1',
      description: 'Show all products',
      action: () => setSelectedCategory('all'),
    },
    ...(categories.slice(0, 9).map((category, index) => ({
      key: String(index + 2),
      description: `Show ${category.name}`,
      action: () => setSelectedCategory(category.id),
    }))),
  ]

  useKeyboardShortcuts({ shortcuts })

  // Quick add first visible product with Enter
  useEffect(() => {
    const handleQuickAdd = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && products.length > 0 && searchQuery) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          handleAddToCart(products[0])
          setSearchQuery('')
        }
      }
    }
    
    window.addEventListener('keydown', handleQuickAdd)
    return () => window.removeEventListener('keydown', handleQuickAdd)
  }, [products, searchQuery])

  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Point of Sale</h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Select products to create an order</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Shortcuts
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Keyboard Shortcuts</SheetTitle>
                  <SheetDescription>
                    Use these shortcuts to navigate faster
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <KeyboardShortcutsHelp shortcuts={shortcuts} />
                </div>
              </SheetContent>
            </Sheet>
            <a href="/pos/orders" className="text-sm text-muted-foreground hover:text-foreground hidden md:block">
              Order History
            </a>
            <div className="hidden md:flex items-center gap-4">
              <NavLinks />
              <UserMenuClient />
            </div>
            <div className="md:hidden">
              <UserMenuClient />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 md:p-4 bg-white border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-white px-3 md:px-4 overflow-x-auto flex-nowrap">
              <TabsTrigger value="all">All Products</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="flex-1 overflow-auto p-3 md:p-4 mt-0 pb-24 lg:pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAddToCart(product)}
                  >
                    <CardContent className="p-4">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {!product.available && (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {products.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart Sidebar - Desktop */}
        <div className="hidden lg:flex w-96 bg-white border-l flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Cart</h2>
              {getItemCount() > 0 && (
                <Badge>{getItemCount()} items</Badge>
              )}
            </div>
          </div>
          
          <POSCart />
          
          <div className="p-4 border-t">
            <Button
              className="w-full"
              size="lg"
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              Checkout
            </Button>
          </div>
        </div>

        {/* Mobile Cart Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart {getItemCount() > 0 && `(${getItemCount()})`}
          </Button>
        </div>

        {/* Mobile Cart Sheet */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full mt-4">
              <POSCart />
              <div className="p-4 border-t mt-auto">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0}
                  onClick={() => {
                    setCartOpen(false)
                    setCheckoutOpen(true)
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  )
}
