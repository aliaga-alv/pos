'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useCustomerCartStore } from '@/store/customer-cart-store'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  categoryId: string
  available: boolean
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCustomerCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl || undefined,
      },
      quantity
    )
    toast.success(`Added ${quantity}x ${product.name} to cart`)
    setQuantity(1)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Product Image */}
      <div className="relative h-40 sm:h-48 bg-slate-200">"
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <p className="text-2xl font-bold text-primary">
          ${Number(product.price).toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        {/* Quantity Selector */}
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button className="flex-1" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
