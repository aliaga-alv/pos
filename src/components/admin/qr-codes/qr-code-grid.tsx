'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, QrCode } from 'lucide-react'
import Image from 'next/image'

interface Table {
  id: string
  number: number
  seats: number
}

interface QRCodeGridProps {
  tables: Table[]
}

export function QRCodeGrid({ tables }: QRCodeGridProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (tableNumber: number, tableId: string) => {
    setDownloading(tableId)
    try {
      const qrUrl = `/qr/table-${String(tableNumber).padStart(2, '0')}.png`
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `table-${tableNumber}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download QR code:', error)
    } finally {
      setDownloading(null)
    }
  }

  const handlePrint = (tableNumber: number) => {
    const qrUrl = `/qr/table-${String(tableNumber).padStart(2, '0')}.png`
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Table ${tableNumber} QR Code</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .qr-container {
                text-align: center;
                page-break-after: always;
              }
              h1 {
                font-size: 48px;
                margin-bottom: 20px;
                color: #1a1a1a;
              }
              img {
                max-width: 512px;
                height: auto;
              }
              p {
                font-size: 24px;
                color: #666;
                margin-top: 20px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>Table ${tableNumber}</h1>
              <img src="${window.location.origin}${qrUrl}" alt="Table ${tableNumber} QR Code" />
              <p>Scan to view menu and order</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const qrCodes = tables
        .map(
          (table) => `
        <div class="qr-container">
          <h1>Table ${table.number}</h1>
          <img src="${window.location.origin}/qr/table-${String(table.number).padStart(2, '0')}.png" alt="Table ${table.number} QR Code" />
          <p>Scan to view menu and order</p>
        </div>
      `
        )
        .join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>All Table QR Codes</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .qr-container {
                text-align: center;
                page-break-after: always;
                padding: 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .qr-container:last-child {
                page-break-after: auto;
              }
              h1 {
                font-size: 48px;
                margin-bottom: 20px;
                color: #1a1a1a;
              }
              img {
                max-width: 512px;
                height: auto;
              }
              p {
                font-size: 24px;
                color: #666;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            ${qrCodes}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  if (tables.length === 0) {
    return (
      <Card className="p-8 text-center">
        <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No QR Codes Available</h3>
        <p className="text-muted-foreground">
          Create tables first to generate QR codes
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handlePrintAll} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print All QR Codes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const qrUrl = `/qr/table-${String(table.number).padStart(2, '0')}.png`

          return (
            <Card key={table.id} className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">
                  Table {table.number}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {table.seats} seats
                </p>
              </div>

              <div className="relative aspect-square bg-white rounded-lg border p-4">
                <Image
                  src={qrUrl}
                  alt={`QR Code for Table ${table.number}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(table.number, table.id)}
                  disabled={downloading === table.id}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading === table.id ? 'Downloading...' : 'Download'}
                </Button>
                <Button
                  onClick={() => handlePrint(table.number)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                  /menu/{table.id.slice(0, 8)}...
                </code>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
