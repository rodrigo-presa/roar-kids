import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, CartMode } from '../types'

interface CartState {
  items: CartItem[]
  mode: CartMode
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; variantId: string }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_MODE'; mode: CartMode }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.variantId === action.payload.variantId)
      if (existing) {
        const newQty = Math.min(existing.quantity + action.payload.quantity, existing.maxStock)
        return {
          ...state,
          items: state.items.map(i =>
            i.variantId === action.payload.variantId ? { ...i, quantity: newQty } : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.variantId !== action.variantId) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.variantId !== action.variantId) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.variantId === action.variantId
            ? { ...i, quantity: Math.min(action.quantity, i.maxStock) }
            : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return { ...state, isOpen: false }
    case 'SET_MODE':
      return { ...state, mode: action.mode, items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  mode: CartMode
  isOpen: boolean
  itemCount: number
  subtotal: number
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  setMode: (mode: CartMode) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    mode: 'retail',
    isOpen: false,
  })

  const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      mode: state.mode,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (variantId) => dispatch({ type: 'REMOVE_ITEM', variantId }),
      updateQty: (variantId, quantity) => dispatch({ type: 'UPDATE_QTY', variantId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      openCart: () => dispatch({ type: 'OPEN' }),
      closeCart: () => dispatch({ type: 'CLOSE' }),
      setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
