import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Clear all cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const response = NextResponse.json({ success: true })
    
    // Remove Supabase auth cookies
    allCookies.forEach((cookie) => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        response.cookies.delete(cookie.name)
      }
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
