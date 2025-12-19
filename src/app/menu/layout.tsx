import { ShoppingCart, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartBadge } from '@/components/menu/cart-badge'

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <Link href="/menu" className="flex items-center gap-1.5 md:gap-2">
            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="font-bold text-base md:text-xl">Restaurant Menu</span>
          </Link>

          <Link href="/menu/cart">
            <Button variant="outline" size="sm" className="relative text-xs md:text-sm">
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Cart</span>
              <CartBadge />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 md:mt-12">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>Scan the QR code at your table to order directly</p>
        </div>
      </footer>
    </div>
  )
}
