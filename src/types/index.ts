// ── Enums ─────────────────────────────────────────────────────
export type UserRole = 'retail' | 'wholesale' | 'admin'
export type WholesaleStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_process'
export type WholesaleRequestStatus = 'pending' | 'confirmed' | 'cancelled'

// ── Usuario / Perfil ──────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  wholesale_status: WholesaleStatus | null
  business_name: string | null
  cuit: string | null
  created_at: string
  updated_at: string
}

// ── Catálogo ──────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
}

export interface Color {
  id: string
  name: string
  hex_code: string | null
}

export interface Size {
  id: string
  name: string
  sort_order: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  color_id: string | null
  size_id: string | null
  stock: number
  sku: string | null
  color?: Color
  size?: Size
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  retail_price: number
  wholesale_price: number | null   // null si el usuario no es mayorista
  is_published: boolean
  featured: boolean
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

// ── Carrito ───────────────────────────────────────────────────
export interface CartItem {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  colorId: string | null
  colorName: string | null
  colorHex: string | null
  sizeId: string | null
  sizeName: string | null
  price: number          // precio unitario (retail o wholesale según modo)
  quantity: number
  imageUrl: string | null
  maxStock: number
}

export type CartMode = 'retail' | 'wholesale'

// ── Checkout ──────────────────────────────────────────────────
export interface ShippingAddress {
  full_name: string
  phone: string
  dni: string
  address: string
  city: string
  province: string
  postal_code: string
}

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimated_days: number
}

// ── Pedidos ───────────────────────────────────────────────────
export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  mp_payment_id: string | null
  subtotal: number
  shipping_cost: number
  total: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  buyer_dni: string | null
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal_code: string
  shipping_method: string | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string | null
  product_id: string | null
  product_name: string
  color_name: string | null
  size_name: string | null
  quantity: number
  unit_price: number
  total_price: number
}

// ── Mayoristas ────────────────────────────────────────────────
export interface WholesaleRequest {
  id: string
  request_number: string
  user_id: string
  status: WholesaleRequestStatus
  notes: string | null
  wa_message_sent: boolean
  created_at: string
  items?: WholesaleRequestItem[]
}

export interface WholesaleRequestItem {
  id: string
  request_id: string
  variant_id: string | null
  product_id: string | null
  product_name: string
  color_name: string | null
  size_name: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface WholesaleApplication {
  id: string
  user_id: string
  business_name: string
  cuit: string
  phone: string
  city: string | null
  province: string | null
  message: string | null
  status: WholesaleStatus
  created_at: string
}

// ── Admin ─────────────────────────────────────────────────────
export interface DashboardStats {
  total_orders: number
  orders_today: number
  revenue_today: number
  revenue_month: number
  pending_wholesale: number
  low_stock_variants: number
}
