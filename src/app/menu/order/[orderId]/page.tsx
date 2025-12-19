import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OrderTracker } from '@/components/menu/order-tracker'

interface PageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { orderId } = await params
  
  // Fetch order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      table: true,
    },
  })

  if (!order) {
    notFound()
  }

  // Serialize Decimal fields to numbers for client component
  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    total: Number(order.total),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })),
  }

  return (
    <div className="max-w-3xl mx-auto">
      <OrderTracker order={serializedOrder} />
    </div>
  )
}
