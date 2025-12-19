import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { UserMenu } from '@/components/layout/user-menu'
import { AdminNavLinks } from '@/components/layout/admin-nav-links'
import { AdminMobileNav } from '@/components/layout/admin-mobile-nav'
import type { UserRole } from '@/lib/permissions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get user details from database
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Admin Panel</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Restaurant Management System
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <AdminMobileNav role={user.role as UserRole} />
              <div className="hidden md:block">
                <AdminNavLinks role={user.role as UserRole} />
              </div>
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">{children}</main>
    </div>
  )
}
