'use client'

import { useEffect, useState } from 'react'
import { canAccessPath, type UserRole } from '@/lib/permissions'

export function NavLinks() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setRole(data.role)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  if (!mounted || !role) {
    return null
  }

  return (
    <>
      {canAccessPath(role, '/pos') && (
        <a
          href="/pos"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          POS Terminal
        </a>
      )}
      {canAccessPath(role, '/kitchen') && (
        <a
          href="/kitchen"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Kitchen
        </a>
      )}
      {canAccessPath(role, '/admin') && (
        <a
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Admin Panel
        </a>
      )}
    </>
  )
}
