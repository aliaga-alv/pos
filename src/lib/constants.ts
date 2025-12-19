export const APP_NAME = 'Restaurant POS'
export const TAX_RATE = 0.1 // 10% tax rate - adjust as needed

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const ORDER_TYPES = {
  COUNTER: 'COUNTER',
  TABLE: 'TABLE',
} as const

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  OTHER: 'OTHER',
} as const

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
  CASHIER: 'CASHIER',
} as const
