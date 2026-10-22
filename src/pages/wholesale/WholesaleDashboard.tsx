import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingBag, MessageCircle, Loader2, X, Plus, Minus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabase'
import { formatPrice, buildWhatsAppMessage } from '../../lib/utils'
import { toast } from 'sonner'
import ProductCard from '../../components/product/ProductCard'
import type { CartItem } from '../../types'

const WHATSAPP_NUMBER = '5491124061807'

export default function WholesaleDashboard() {
  const { isWholesale, user } = useAuth()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const [selectedCat, setSelectedCat] = useState<string | undefined>()
  const { data: products, isLoading } = useProducts(selectedCat)

  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  if (!isWholesale) {
    navigate('/mayoristas')
    return null
  }


  const updateQty = (variantId: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.variantId !== variantId))
    else setCart(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: Math.min(qty, i.maxStock) } : i))
  }

  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    setSubmitting(true)

    const { data: request, error: reqErr } = await supabase
      .from('wholesale_requests')
      .insert({ user_id: user!.id })
      .select()
      .single()

    if (reqErr || !request) {
      toast.error('No se pudo crear la solicitud')
      setSubmitting(false)
      return
    }

    const items = cart.map(item => ({
      request_id: request.id,
      variant_id: item.variantId,
      product_id: item.productId,
      product_name: item.productName,
      color_name: item.colorName,
      size_name: item.sizeName,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    await supabase.from('wholesale_request_items').insert(items)

    // Construir mensaje de WhatsApp
    const waMessage = buildWhatsAppMessage(request.request_number, cart.map(i => ({
      product_name: i.productName,
      color_name: i.colorName,
      size_name: i.sizeName,
      quantity: i.quantity,
      unit_price: i.price,
    })))

    await supabase.from('wholesale_requests').update({ wa_message_sent: true }).eq('id', request.id)

    setCart([])
    setSubmitting(false)

    // Abrir WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank')
    toast.success(`Solicitud #${request.request_number} enviada`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-roar-sky/30 text-roar-graphite mb-2">
            Panel Mayorista
          </span>
          <h1 className="text-2xl font-bold text-roar-graphite">Catálogo mayorista</h1>
          <p className="text-sm text-gray-400 mt-0.5">Todos los precios son mayoristas y exclusivos para vos.</p>
        </div>
        <Link to="/mis-pedidos" className="btn-ghost text-sm hidden md:flex">
          Mis solicitudes
        </Link>
      </div>

      {/* Filtro categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setSelectedCat(undefined)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCat ? 'bg-roar-orange text-white' : 'bg-gray-100 text-roar-graphite hover:bg-gray-200'
          }`}
        >
          Todo
        </button>
        {categories?.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.slug)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCat === cat.slug ? 'bg-roar-orange text-white' : 'bg-gray-100 text-roar-graphite hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Catálogo */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Carrito mayorista */}
        {cart.length > 0 && (
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-roar-graphite flex items-center gap-2">
                  <ShoppingBag size={16} className="text-roar-orange" />
                  Mi pedido ({cartCount})
                </h3>
              </div>

              <ul className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <li key={item.variantId} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-roar-graphite truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">
                        {[item.colorName, item.sizeName && `T.${item.sizeName}`].filter(Boolean).join(' · ')}
                      </p>
                      <p className="text-xs font-semibold text-roar-sky mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.variantId, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100">
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxStock} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-40">
                        <Plus size={11} />
                      </button>
                      <button onClick={() => updateQty(item.variantId, 0)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-300 hover:text-red-400">
                        <X size={11} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between text-sm font-bold text-roar-graphite">
                  <span>Estimado:</span>
                  <span className="text-roar-orange">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Sujeto a confirmación de stock</p>
              </div>

              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full text-sm py-2.5">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <><MessageCircle size={15} /> Enviar por WhatsApp</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carrito flotante mobile */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button onClick={handleSubmit} disabled={submitting} className="w-full btn-primary py-4 text-base shadow-xl">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                <MessageCircle size={18} />
                Enviar solicitud ({cartCount} items) — {formatPrice(cartTotal)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
