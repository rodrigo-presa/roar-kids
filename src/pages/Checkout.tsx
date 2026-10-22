import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, MapPin, CreditCard, Package, ChevronRight, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import { toast } from 'sonner'

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]

const SHIPPING_METHODS = [
  { id: 'correo_clasico', name: 'Correo Argentino Clásico', price: 2500, days: '5 a 8 días hábiles' },
  { id: 'correo_express', name: 'Correo Argentino Express', price: 4500, days: '2 a 3 días hábiles' },
]

const WA_NUMBER = '5491124061807'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'datos' | 'envio' | 'pago'>('datos')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    dni: '',
    address: '',
    city: '',
    province: 'Buenos Aires',
    postal_code: '',
  })
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0])

  const shippingCost = shippingMethod.price
  const total = subtotal + shippingCost

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // Para usuarios registrados: guarda en Supabase
  const handleCreateOrder = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal,
          shipping_cost: shippingCost,
          total,
          buyer_name: form.full_name,
          buyer_email: user.email,
          buyer_phone: form.phone,
          buyer_dni: form.dni,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_province: form.province,
          shipping_postal_code: form.postal_code,
          shipping_method: shippingMethod.name,
        })
        .select()
        .single()

      if (orderErr || !order) throw new Error('No se pudo crear el pedido')

      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_id: item.productId,
        product_name: item.productName,
        color_name: item.colorName,
        size_name: item.sizeName,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (itemsErr) throw new Error('Error al guardar los productos del pedido')

      toast.success('¡Pedido creado! Redirigiendo al pago...')
      clear()
      navigate(`/pedido-confirmado/${order.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Para invitados: arma el pedido como mensaje de WhatsApp
  const handleGuestWhatsApp = () => {
    const lines = [
      '🛍️ *Nuevo pedido ROAR! Kids*',
      '',
      `👤 *${form.full_name}*`,
      form.phone ? `📱 ${form.phone}` : '',
      form.email ? `✉️ ${form.email}` : '',
      form.dni ? `DNI: ${form.dni}` : '',
      '',
      '📦 *Productos:*',
      ...items.map(item => {
        const color = item.colorName ? ` (${item.colorName})` : ''
        const size = item.sizeName ? ` T.${item.sizeName}` : ''
        return `• ${item.productName}${color}${size} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
      }),
      '',
      '🚚 *Envío:*',
      `${form.address}, ${form.city}, ${form.province} (${form.postal_code})`,
      `Método: ${shippingMethod.name} — ${formatPrice(shippingCost)}`,
      '',
      `💰 *Total: ${formatPrice(total)}*`,
    ].filter(l => l !== undefined && l !== null)

    const msg = encodeURIComponent(lines.join('\n'))
    clear()
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
    navigate('/')
  }

  if (items.length === 0) {
    navigate('/catalogo')
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-roar-graphite mb-8">Finalizar compra</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['datos', 'envio', 'pago'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              step === s ? 'bg-roar-orange text-white' :
              (['datos', 'envio', 'pago'].indexOf(step) > i) ? 'bg-roar-orange/20 text-roar-orange' :
              'bg-gray-100 text-gray-400'
            }`}>
              <span>{i + 1}</span>
              <span className="hidden sm:block capitalize">{s === 'datos' ? 'Mis datos' : s === 'envio' ? 'Envío' : 'Pago'}</span>
            </div>
            {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* Paso 1: Datos */}
          {step === 'datos' && (
            <div className="card p-6">
              <h2 className="font-semibold text-roar-graphite flex items-center gap-2 mb-5">
                <MapPin size={18} className="text-roar-orange" /> Datos personales y de entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Nombre y apellido</label>
                  <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Teléfono / WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input" placeholder="011 1234-5678" />
                </div>
                {!user && (
                  <div>
                    <label className="block text-sm font-medium text-roar-graphite mb-1.5">Email (opcional)</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input" placeholder="tu@email.com" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">DNI</label>
                  <input type="text" value={form.dni} onChange={e => update('dni', e.target.value)} className="input" placeholder="12345678" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Dirección</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className="input" placeholder="Av. Corrientes 1234, piso 2, depto B" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Ciudad</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className="input" placeholder="Buenos Aires" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Código postal</label>
                  <input type="text" value={form.postal_code} onChange={e => update('postal_code', e.target.value)} className="input" placeholder="1414" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Provincia</label>
                  <select value={form.province} onChange={e => update('province', e.target.value)} className="input">
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep('envio')}
                disabled={!form.full_name || !form.address || !form.city || !form.postal_code}
                className="btn-primary mt-6 w-full py-3"
              >
                Continuar al envío
              </button>
            </div>
          )}

          {/* Paso 2: Envío */}
          {step === 'envio' && (
            <div className="card p-6">
              <h2 className="font-semibold text-roar-graphite flex items-center gap-2 mb-5">
                <Package size={18} className="text-roar-orange" /> Elegí tu método de envío
              </h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      shippingMethod.id === method.id
                        ? 'border-roar-orange bg-brand-light'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod.id === method.id}
                      onChange={() => setShippingMethod(method)}
                      className="mt-0.5 accent-roar-orange"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-roar-graphite">{method.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{method.days}</p>
                    </div>
                    <p className="text-sm font-bold text-roar-graphite">{formatPrice(method.price)}</p>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('datos')} className="btn-ghost flex-1">Atrás</button>
                <button onClick={() => setStep('pago')} className="btn-primary flex-1 py-3">Ir al pago</button>
              </div>
            </div>
          )}

          {/* Paso 3: Pago */}
          {step === 'pago' && (
            <div className="card p-6">
              <h2 className="font-semibold text-roar-graphite flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-roar-orange" /> Confirmar y pagar
              </h2>
              <div className="rounded-xl bg-roar-beige/50 p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío ({shippingMethod.name})</span>
                  <span className="font-semibold">{formatPrice(shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-roar-graphite">Total</span>
                  <span className="text-lg font-extrabold text-roar-orange">{formatPrice(total)}</span>
                </div>
              </div>

              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-roar-sky/20 border border-roar-sky/30 mb-6">
                    <img
                      src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large@2x.png"
                      alt="Mercado Pago"
                      className="h-6"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <p className="text-xs text-gray-500">Pagás de forma segura con Mercado Pago. Tarjetas, transferencia y más.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('envio')} className="btn-ghost flex-1">Atrás</button>
                    <button onClick={handleCreateOrder} disabled={loading} className="btn-primary flex-1 py-3">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Pagar con Mercado Pago'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
                    <MessageCircle size={22} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Coordinamos el pago por WhatsApp</p>
                      <p className="text-xs text-green-600 mt-0.5">Te vamos a confirmar la disponibilidad y los medios de pago por WhatsApp.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('envio')} className="btn-ghost flex-1">Atrás</button>
                    <button
                      onClick={handleGuestWhatsApp}
                      className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <MessageCircle size={18} />
                      Enviar pedido por WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-roar-graphite mb-4">Resumen del pedido</h3>
          <ul className="space-y-3 mb-4">
            {items.map(item => (
              <li key={item.variantId} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-roar-beige flex-shrink-0">
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-roar-graphite truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">
                    {[item.colorName, item.sizeName && `T.${item.sizeName}`].filter(Boolean).join(' · ')} × {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-bold text-roar-graphite">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Envío</span><span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-roar-graphite pt-1">
              <span>Total</span><span className="text-roar-orange">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
