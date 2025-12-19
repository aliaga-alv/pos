import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomerCartItem {
  productId: string
  name: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
}

interface CustomerCartStore {
  items: CustomerCartItem[]
  tableId: string | null
  customerName: string
  addItem: (item: Omit<CustomerCartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateItemNotes: (productId: string, notes: string) => void
  setTableId: (tableId: string | null) => void
  setCustomerName: (name: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

const TAX_RATE = 0.1 // 10% tax

export const useCustomerCartStore = create<CustomerCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      customerName: '',

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          }
        }),

      updateItemNotes: (productId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, notes } : i
          ),
        })),

      setTableId: (tableId) => set({ tableId }),

      setCustomerName: (name) => set({ customerName: name }),

      clearCart: () => set({ items: [], tableId: null, customerName: '' }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTax: () => {
        const subtotal = get().getSubtotal()
        return subtotal * TAX_RATE
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax()
      },
    }),
    {
      name: 'customer-cart-storage', // unique name for localStorage key
    }
  )
)
