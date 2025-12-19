/**
 * QR Code Generator for Table Menus (TypeScript)
 * 
 * This script generates QR codes for each table in the restaurant.
 * Customers can scan these QR codes to access the table-specific menu.
 * 
 * Usage:
 * 1. Install dependencies: npm install qrcode && npm install -D @types/qrcode tsx
 * 2. Set up your database connection
 * 3. Run: npx tsx scripts/generate-qr-codes-db.ts
 */

import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const QR_OUTPUT_DIR = path.join(process.cwd(), 'public/qr')

// Ensure output directory exists
if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true })
  console.log(`Created directory: ${QR_OUTPUT_DIR}`)
}

async function generateQRCode(tableNumber: number, tableId: string) {
  const url = `${BASE_URL}/menu/${tableId}`
  const filename = `table-${String(tableNumber).padStart(2, '0')}.png`
  const filepath = path.join(QR_OUTPUT_DIR, filename)

  try {
    await QRCode.toFile(filepath, url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    console.log(`✓ Generated QR code for Table ${tableNumber}: ${filename}`)
    return { tableNumber, url, filename }
  } catch (error) {
    console.error(`✗ Failed to generate QR code for Table ${tableNumber}:`, error)
    return null
  }
}

async function generateAllQRCodes() {
  console.log('\n=== QR Code Generator for Restaurant Tables ===\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Output Directory: ${QR_OUTPUT_DIR}\n`)

  try {
    // Fetch all tables from database
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    })

    console.log(`Found ${tables.length} tables in database\n`)

    if (tables.length === 0) {
      console.log('No tables found. Please add tables to your database first.')
      return
    }

    const results = []
    
    for (const table of tables) {
      const result = await generateQRCode(table.number, table.id)
      if (result) {
        results.push(result)
      }
    }

    console.log(`\n=== Summary ===`)
    console.log(`Successfully generated ${results.length} QR codes`)
    console.log(`Location: ${QR_OUTPUT_DIR}`)
    console.log(`\nQR Code URLs:`)
    results.forEach(r => {
      console.log(`  Table ${r.tableNumber}: ${r.url}`)
    })
    console.log(`\nTo use these QR codes:`)
    console.log(`1. Print the PNG files from ${QR_OUTPUT_DIR}`)
    console.log(`2. Place them on corresponding tables`)
    console.log(`3. Customers scan to access the menu`)
  } catch (error) {
    console.error('Error generating QR codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the generator
generateAllQRCodes().catch(console.error)
