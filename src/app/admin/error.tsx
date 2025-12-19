'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin Error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Admin Panel Error</CardTitle>
          <CardDescription>
            Failed to load admin data. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="bg-slate-100 p-3 rounded-md">
              <p className="text-sm text-slate-700 font-mono">{error.message}</p>
            </div>
          )}
          <Button onClick={reset} className="w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
