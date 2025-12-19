import { prisma } from '@/lib/prisma'
import { QRCodeGrid } from '@/components/admin/qr-codes/qr-code-grid'

export default async function QRCodesPage() {
  const tables = await prisma.table.findMany({
    orderBy: { number: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground mt-2">
            Download and print QR codes for your tables
          </p>
        </div>
      </div>

      <QRCodeGrid tables={tables} />
    </div>
  )
}
