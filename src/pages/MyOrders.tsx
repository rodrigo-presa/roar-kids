import { useNavigate } from 'react-router-dom'
import { Package, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/utils'
import type { Order } from '../types'

const statusColors: Record<string, string> = {
  pending: 'bg-roar-yellow/30 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-roar-sky/30 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-100 text-red-600',
}
const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function MyOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!user) {
    navigate('/ingresar', { state: { from: '/mis-pedidos' } })
    return null
  }

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-roar-graphite mb-6">Mis pedidos</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={40} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-roar-graphite mb-2">Todavía no tenés pedidos</h2>
          <p className="text-sm text-gray-400 mb-6">Cuando hagas tu primera compra, la vas a ver acá.</p>
          <button onClick={() => navigate('/catalogo')} className="btn-primary text-sm">
            Ver catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders?.map(order => (
            <div key={order.id} className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-roar-orange">{order.order_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} · {formatPrice(order.total)}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <ChevronDown size={16} className={`transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedId === order.id && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                  <div className="space-y-2 mb-4">
                    {(order as any).items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product_name}
                          {[item.color_name, item.size_name && `T.${item.size_name}`].filter(Boolean).length > 0 && (
                            <span className="text-gray-400"> · {[item.color_name, item.size_name && `T.${item.size_name}`].filter(Boolean).join(', ')}</span>
                          )}
                          <span className="text-gray-400"> × {item.quantity}</span>
                        </span>
                        <span className="font-medium text-roar-graphite">{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-1 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Envío ({order.shipping_method})</span>
                      <span>{formatPrice(order.shipping_cost ?? 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-roar-graphite">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {order.shipping_address && (
                    <p className="mt-3 text-xs text-gray-400">
                      Envío a: {order.shipping_address}, {order.shipping_city}, {order.shipping_province}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
