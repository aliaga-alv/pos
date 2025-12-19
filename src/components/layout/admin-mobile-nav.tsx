'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { canAccessPath, type UserRole } from '@/lib/permissions'
import { useRouter } from 'next/navigation'

interface AdminMobileNavProps {
  role: UserRole
}

export function AdminMobileNav({ role }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleNavClick = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Admin Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          <button
            onClick={() => handleNavClick('/admin')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('/admin/inventory')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Inventory
          </button>
          <button
            onClick={() => handleNavClick('/admin/products')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Products
          </button>
          <button
            onClick={() => handleNavClick('/admin/categories')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('/admin/tables')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Tables
          </button>
          <button
            onClick={() => handleNavClick('/admin/users')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Users
          </button>
          <button
            onClick={() => handleNavClick('/admin/reports')}
            className="px-3 py-2.5 text-sm hover:bg-slate-100 rounded-md text-left"
          >
            Reports
          </button>

          {canAccessPath(role, '/pos') && (
            <>
              <div className="border-t my-2" />
              <button
                onClick={() => handleNavClick('/pos')}
                className="px-3 py-2.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md text-left font-medium"
              >
                Go to POS
              </button>
            </>
          )}
          {canAccessPath(role, '/kitchen') && (
            <button
              onClick={() => handleNavClick('/kitchen')}
              className="px-3 py-2.5 text-sm bg-orange-500 text-white hover:bg-orange-600 rounded-md text-left font-medium"
            >
              Go to Kitchen
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
