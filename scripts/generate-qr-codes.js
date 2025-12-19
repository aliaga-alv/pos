/**
 * QR Code Generator for Table Menus
 *
 * This script generates QR codes for each table in the restaurant.
 * Customers can scan these QR codes to access the table-specific menu.
 *
 * Usage:
 * 1. Install qrcode package: npm install qrcode
 * 2. Run: node scripts/generate-qr-codes.js
 *
 * For TypeScript version:
 * 1. Install: npm install -D @types/qrcode
 * 2. Run: tsx scripts/generate-qr-codes.ts
 */

require('dotenv').config({ path: '.env.local' })
const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const QR_OUTPUT_DIR = path.join(__dirname, '../public/qr')
const NUM_TABLES = 20 // Generate QR codes for 20 tables

// Ensure output directory exists
if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true })
  console.log(`Created directory: ${QR_OUTPUT_DIR}`)
}

async function generateQRCode(tableNumber, tableId) {
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
    console.error(
      `✗ Failed to generate QR code for Table ${tableNumber}:`,
      error
    )
    return null
  }
}

async function generateAllQRCodes() {
  console.log('\n=== QR Code Generator for Restaurant Tables ===\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Output Directory: ${QR_OUTPUT_DIR}`)
  console.log(`Fetching tables from database...\n`)

  try {
    // Fetch actual tables from database
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    })

    if (tables.length === 0) {
      console.log('No tables found in database. Please create tables first.')
      return
    }

    console.log(`Found ${tables.length} tables in database`)
    console.log(`Generating QR codes...\n`)

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
    console.log(`\nTo use these QR codes:`)
    console.log(`1. Print the QR codes`)
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
