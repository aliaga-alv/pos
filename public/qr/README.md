# QR Code Generation for Table Menus

This directory contains QR codes for each restaurant table. Customers can scan these codes to access the digital menu and place orders directly from their table.

## How It Works

1. Each table has a unique QR code that links to `/menu/[tableId]`
2. When scanned, customers are taken to the menu with their table pre-selected
3. Customers can browse the menu, add items to cart, and place orders
4. Orders are automatically associated with the table number

## Generating QR Codes

### Prerequisites

Install the required dependencies:

```bash
npm install qrcode
npm install -D @types/qrcode tsx
```

### Method 1: From Database (Recommended)

This method fetches actual table IDs from your database:

```bash
npx tsx scripts/generate-qr-codes-db.ts
```

### Method 2: Manual Generation

If you prefer to manually specify tables:

```bash
node scripts/generate-qr-codes.js
```

Note: You'll need to update the table IDs in the script to match your database.

## Environment Variables

Make sure to set the correct base URL in your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

For local development, this defaults to `http://localhost:3000`.

## Using the QR Codes

1. **Print**: Print the QR code PNG files (512x512px)
2. **Label**: Each file is named `table-XX.png` where XX is the table number
3. **Display**: Place the printed QR codes on corresponding tables
4. **Test**: Scan with a phone to verify the URL is correct

## QR Code Specifications

- **Size**: 512x512 pixels
- **Format**: PNG
- **Error Correction**: Default (medium)
- **Margin**: 2 modules (quiet zone)
- **Colors**: Black on white

## Customization

To customize QR codes, edit the generation scripts:

```typescript
await QRCode.toFile(filepath, url, {
  width: 512,           // Size in pixels
  margin: 2,            // Quiet zone
  color: {
    dark: '#000000',    // Foreground color
    light: '#FFFFFF',   // Background color
  },
})
```

## Testing

Test the QR codes locally:

1. Start the development server: `npm run dev`
2. Scan a QR code with your phone
3. Verify you're redirected to the correct table menu
4. Test adding items to cart and placing an order

## Troubleshooting

**QR code doesn't scan:**
- Ensure sufficient lighting
- Check the QR code isn't damaged or blurry
- Verify the URL is correct

**Wrong table assigned:**
- Regenerate QR codes after updating table IDs
- Verify the table exists in the database

**Orders not working:**
- Check that the table status is not RESERVED
- Verify the products are marked as available
- Check browser console for errors
