import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateUserSchema } from '@/lib/validations/user'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If updating email, check if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update Supabase auth user if password or metadata changed
    if (validatedData.password || validatedData.email || validatedData.name || validatedData.role) {
      const supabase = createAdminClient()
      
      // First check if user exists in Supabase Auth
      const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(id)
      
      // Check if it's an error other than "user not found"
      const userNotFound = getUserError?.status === 404 || getUserError?.code === 'user_not_found'
      
      if (getUserError && !userNotFound) {
        console.error('Supabase auth get user error:', getUserError)
        return NextResponse.json(
          { error: 'Failed to check auth user: ' + getUserError.message },
          { status: 500 }
        )
      }

      // If user doesn't exist in Supabase Auth, create them
      if (userNotFound || !authUser?.user) {
        if (!validatedData.password) {
          return NextResponse.json(
            { error: 'Password is required to create auth user' },
            { status: 400 }
          )
        }

        const { error: createError } = await supabase.auth.admin.createUser({
          id,
          email: validatedData.email || existingUser.email,
          password: validatedData.password,
          email_confirm: true,
          user_metadata: {
            name: validatedData.name || existingUser.name,
            role: validatedData.role || existingUser.role,
          },
        })

        if (createError) {
          console.error('Supabase auth create error:', createError)
          return NextResponse.json(
            { error: 'Failed to create auth user: ' + createError.message },
            { status: 500 }
          )
        }
      } else {
        // User exists, update them
        const updateData: any = {}
        
        if (validatedData.password) {
          updateData.password = validatedData.password
        }
        if (validatedData.email) {
          updateData.email = validatedData.email
        }
        if (validatedData.name || validatedData.role) {
          updateData.user_metadata = {
            name: validatedData.name || existingUser.name,
            role: validatedData.role || existingUser.role,
          }
        }

        const { error: authError } = await supabase.auth.admin.updateUserById(
          id,
          updateData
        )

        if (authError) {
          console.error('Supabase auth update error:', authError)
          return NextResponse.json(
            { error: 'Failed to update auth user: ' + authError.message },
            { status: 500 }
          )
        }
      }
    }

    // Update user in database (excluding password)
    const { password, ...dbData } = validatedData
    const user = await prisma.user.update({
      where: { id },
      data: dbData,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Deactivate user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Don't actually delete, just deactivate
    const user = await prisma.user.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
  }
}
