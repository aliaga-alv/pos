import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Sync user role from database to Supabase auth user_metadata
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, name: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Update Supabase auth user_metadata with role
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        role: dbUser.role,
        name: dbUser.name,
      },
    })

    if (error) {
      console.error('Error updating user metadata:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      role: dbUser.role,
      message: 'Role synced successfully. Please log out and log in again.' 
    })
  } catch (error) {
    console.error('Sync role error:', error)
    return NextResponse.json(
      { error: 'Failed to sync role' },
      { status: 500 }
    )
  }
}
