import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TableMenuClient } from '@/components/menu/table-menu-client'

interface PageProps {
  params: Promise<{
    tableId: string
  }>
}

export default async function TableMenuPage({ params }: PageProps) {
  const { tableId } = await params
  
  // Validate that the table exists
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  })

  if (!table) {
    notFound()
  }

  return <TableMenuClient table={table} />
}
