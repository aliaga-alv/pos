import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, Monitor, ChefHat, ShieldCheck, Menu } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <UtensilsCrossed className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Restaurant POS</h1>
          </div>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Modern restaurant management system with POS, kitchen display, and customer ordering
          </p>
        </div>

        {/* Main Sections */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
          {/* Customer Menu */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Menu className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Customer Menu</CardTitle>
              <CardDescription>
                Browse our menu and place orders online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/menu">
                <Button className="w-full" size="lg">
                  View Menu
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No login required
              </p>
            </CardContent>
          </Card>

          {/* POS Terminal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>POS Terminal</CardTitle>
              <CardDescription>
                Take orders and process payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pos">
                <Button className="w-full" variant="outline" size="lg">
                  Open POS
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Staff login required
              </p>
            </CardContent>
          </Card>

          {/* Kitchen Display */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-3">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Kitchen Display</CardTitle>
              <CardDescription>
                View and manage order queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/kitchen">
                <Button className="w-full" variant="outline" size="lg">
                  Open Kitchen
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Kitchen staff login required
              </p>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage inventory, products, users & reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full" variant="outline" size="lg">
                  Admin Access
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Admin login required
              </p>
            </CardContent>
          </Card>

          {/* Staff Login */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2">
            <CardHeader>
              <CardTitle>Staff Access</CardTitle>
              <CardDescription>
                Login to access POS, Kitchen, or Admin features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full" size="lg" variant="default">
                  Staff Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">QR Code Ordering</h3>
              <p className="text-sm text-muted-foreground">
                Scan table QR codes for contactless ordering
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Kitchen gets orders instantly, customers track status
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Inventory Management</h3>
              <p className="text-sm text-muted-foreground">
                Track stock levels and manage products
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
