import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validations/payment'
import { createClient } from '@/lib/supabase/server'

// POST /api/payments - Create payment and complete order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Get order to verify it exists and get total
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: { payment: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment) {
      return NextResponse.json(
        { error: 'Order already has a payment' },
        { status: 400 }
      )
    }

    // Verify payment amount matches order total
    if (validatedData.amount !== Number(order.total)) {
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      )
    }

    // Create payment and update order status
    const payment = await prisma.payment.create({
      data: {
        orderId: validatedData.orderId,
        method: validatedData.method,
        amount: validatedData.amount,
      },
    })

    // Update order status to COMPLETED
    await prisma.order.update({
      where: { id: validatedData.orderId },
      data: { status: 'COMPLETED' },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('POST /api/payments error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
