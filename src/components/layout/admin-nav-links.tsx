'use client'

import { canAccessPath, type UserRole } from '@/lib/permissions'

interface AdminNavLinksProps {
  role: UserRole
}

export function AdminNavLinks({ role }: AdminNavLinksProps) {
  return (
    <nav className="flex gap-2">
      <a
        href="/admin"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Dashboard
      </a>
      <a
        href="/admin/inventory"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Inventory
      </a>
      <a
        href="/admin/products"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Products
      </a>
      <a
        href="/admin/categories"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Categories
      </a>
      <a
        href="/admin/tables"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Tables
      </a>
      <a
        href="/admin/users"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Users
      </a>
      <a
        href="/admin/reports"
        className="px-3 py-2 text-sm hover:bg-slate-100 rounded-md"
      >
        Reports
      </a>
      {canAccessPath(role, '/pos') && (
        <a
          href="/pos"
          className="px-3 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md"
        >
          Go to POS
        </a>
      )}
      {canAccessPath(role, '/kitchen') && (
        <a
          href="/kitchen"
          className="px-3 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md"
        >
          Go to Kitchen
        </a>
      )}
    </nav>
  )
}
