import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getAvailabilityStatus(stock: number): 'available' | 'low' | 'out' {
  if (stock === 0) return 'out'
  if (stock <= 3) return 'low'
  return 'available'
}

export function buildWhatsAppMessage(requestNumber: string, items: Array<{
  product_name: string
  color_name: string | null
  size_name: string | null
  quantity: number
  unit_price: number
}>): string {
  const lines = items.map(item =>
    `• ${item.product_name}${item.color_name ? ` — ${item.color_name}` : ''}${item.size_name ? ` / Talle ${item.size_name}` : ''} × ${item.quantity} ($ ${item.unit_price * item.quantity})`
  )
  const total = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)

  const message = [
    `¡Hola! Soy cliente mayorista de ROAR! y quiero hacer una consulta de pedido.`,
    ``,
    `*Solicitud N°:* ${requestNumber}`,
    ``,
    `*Productos:*`,
    ...lines,
    ``,
    `*Total estimado:* $ ${total}`,
    ``,
    `Quedo a la espera de confirmación de stock y condiciones. ¡Gracias!`,
  ].join('\n')

  return encodeURIComponent(message)
}
