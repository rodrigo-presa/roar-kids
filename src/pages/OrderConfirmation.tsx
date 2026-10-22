import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Clock, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import type { Order } from '../types'

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Mercado Pago redirige con estos parámetros
  const mpStatus = searchParams.get('status') || searchParams.get('collection_status')

  useEffect(() => {
    if (!orderId) return
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data as Order)
        setLoading(false)
      })
  }, [orderId])

  // Actualizar estado según respuesta de MP
  useEffect(() => {
    if (!orderId || !mpStatus) return
    const paymentStatus = mpStatus === 'approved' ? 'approved' : mpStatus === 'pending' ? 'in_process' : 'rejected'
    const orderStatus = mpStatus === 'approved' ? 'paid' : 'pending'

    supabase
      .from('orders')
      .update({ payment_status: paymentStatus, status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .then(() => {})
  }, [orderId, mpStatus])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-roar-orange" />
      </div>
    )
  }

  const isPaid = mpStatus === 'approved' || order?.payment_status === 'approved'
  const isPending = mpStatus === 'pending' || mpStatus === 'in_process' || order?.payment_status === 'in_process'
  const isRejected = mpStatus === 'failure' || order?.payment_status === 'rejected'

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {isPaid ? (
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
      ) : isPending ? (
        <Clock size={64} className="text-amber-500 mx-auto mb-6" />
      ) : isRejected ? (
        <XCircle size={64} className="text-red-500 mx-auto mb-6" />
      ) : (
        <Package size={64} className="text-roar-orange mx-auto mb-6" />
      )}

      <h1 className="text-2xl font-bold text-roar-graphite mb-3">
        {isPaid ? '¡Pago confirmado!' :
         isPending ? 'Pago en proceso' :
         isRejected ? 'Pago rechazado' :
         '¡Pedido recibido!'}
      </h1>

      <p className="text-gray-400 mb-2">
        {isPaid ? 'Tu pedido fue acreditado y ya estamos preparándolo.' :
         isPending ? 'Tu pago está siendo procesado. Te avisamos cuando se confirme.' :
         isRejected ? 'El pago no se pudo procesar. Podés intentarlo de nuevo.' :
         'Recibimos tu pedido y estamos esperando la confirmación del pago.'}
      </p>

      {order && (
        <p className="text-sm font-semibold text-roar-orange mb-8">Pedido #{order.order_number}</p>
      )}

      {order?.items && order.items.length > 0 && (
        <div className="card p-5 text-left mb-8">
          <h3 className="text-sm font-semibold text-roar-graphite mb-4">Detalle del pedido</h3>
          <ul className="space-y-2.5 mb-4">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {item.product_name}
                  {item.color_name && ` — ${item.color_name}`}
                  {item.size_name && ` / T.${item.size_name}`}
                  {' '}× {item.quantity}
                </span>
                <span className="font-semibold text-roar-graphite">{formatPrice(item.total_price)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-roar-graphite">
            <span>Total pagado</span>
            <span className="text-roar-orange">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/mis-pedidos" className="btn-primary">
          Ver mis pedidos
        </Link>
        <Link to="/catalogo" className="btn-ghost">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
