'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
  notes?: string | null
}

interface Order {
  id: string
  orderNumber: number
  type: string
  customerName: string | null
  subtotal: number
  tax: number
  total: number
  createdAt: Date | string
  table?: {
    number: number
  } | null
  items: OrderItem[]
  payment?: {
    method: string
    paidAt: Date | string
  } | null
}

interface ReceiptProps {
  order: Order
}

export function Receipt({ order }: ReceiptProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Button onClick={handlePrint} className="no-print">
        <Printer className="h-4 w-4 mr-2" />
        Print Receipt
      </Button>

      <div className="receipt-content hidden print:block">
        <div className="receipt-page">
          <div className="receipt-header">
            <h1>Restaurant POS</h1>
            <p>Thank you for your order!</p>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-info">
            <div className="receipt-row">
              <span>Order #:</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{format(new Date(order.createdAt), 'PPpp')}</span>
            </div>
            {order.customerName && (
              <div className="receipt-row">
                <span>Customer:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            {order.table && (
              <div className="receipt-row">
                <span>Table:</span>
                <span>{order.table.number}</span>
              </div>
            )}
            <div className="receipt-row">
              <span>Type:</span>
              <span>{order.type === 'TABLE' ? 'Dine-in' : 'Takeaway'}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-items">
            <div className="receipt-items-header">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="receipt-item">
                  <span className="item-name">{item.product.name}</span>
                  <span>{item.quantity}</span>
                  <span>${Number(item.price).toFixed(2)}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div className="item-notes">Note: {item.notes}</div>
                )}
              </div>
            ))}
          </div>

          <div className="receipt-divider" />

          <div className="receipt-totals">
            <div className="receipt-row">
              <span>Subtotal:</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span>Tax (10%):</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="receipt-row total">
              <strong>Total:</strong>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </div>
          </div>

          {order.payment && (
            <>
              <div className="receipt-divider" />
              <div className="receipt-payment">
                <div className="receipt-row">
                  <span>Payment Method:</span>
                  <span>{order.payment.method}</span>
                </div>
                <div className="receipt-row">
                  <span>Paid At:</span>
                  <span>{format(new Date(order.payment.paidAt), 'PPpp')}</span>
                </div>
                <div className="paid-stamp">PAID</div>
              </div>
            </>
          )}

          <div className="receipt-footer">
            <p>Thank you for dining with us!</p>
            <p>Please visit again</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }

          body * {
            visibility: hidden;
          }

          .receipt-content,
          .receipt-content * {
            visibility: visible;
          }

          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }
        }

        .receipt-page {
          max-width: 80mm;
          margin: 0 auto;
          padding: 10mm;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #000;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 5mm;
        }

        .receipt-header h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 2mm 0;
        }

        .receipt-header p {
          margin: 0;
          font-size: 11px;
        }

        .receipt-divider {
          border-top: 1px dashed #000;
          margin: 3mm 0;
        }

        .receipt-info,
        .receipt-totals,
        .receipt-payment {
          margin: 3mm 0;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin: 1mm 0;
        }

        .receipt-row.total {
          font-size: 14px;
          margin-top: 2mm;
          padding-top: 2mm;
          border-top: 1px solid #000;
        }

        .receipt-items-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          font-weight: bold;
          margin-bottom: 2mm;
          padding-bottom: 1mm;
          border-bottom: 1px solid #000;
        }

        .receipt-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          margin: 1mm 0;
        }

        .item-name {
          font-weight: 500;
        }

        .item-notes {
          font-size: 10px;
          font-style: italic;
          margin-left: 2mm;
          color: #555;
        }

        .paid-stamp {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          color: #22c55e;
          margin: 3mm 0;
          padding: 2mm;
          border: 2px solid #22c55e;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 5mm;
          font-size: 11px;
        }

        .receipt-footer p {
          margin: 1mm 0;
        }
      `}</style>
    </>
  )
}
