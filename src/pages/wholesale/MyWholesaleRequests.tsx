import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-roar-yellow/30 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}
const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

export default function MyWholesaleRequests() {
  const { user, isWholesale } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!isWholesale) {
    navigate('/mayoristas')
    return null
  }

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-wholesale-requests', user!.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wholesale_requests')
        .select('*, items:wholesale_request_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-roar-graphite">Mis solicitudes</h1>
        <button onClick={() => navigate('/mayoristas/panel')} className="btn-ghost text-sm">
          ← Volver al catálogo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : requests?.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={40} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-roar-graphite mb-2">Todavía no hiciste solicitudes</h2>
          <p className="text-sm text-gray-400 mb-6">Cuando envíes un pedido por WhatsApp, lo vas a ver acá.</p>
          <button onClick={() => navigate('/mayoristas/panel')} className="btn-primary text-sm">
            Ver catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests?.map((req: any) => {
            const total = req.items?.reduce((acc: number, i: any) => acc + i.total_price, 0) ?? 0
            return (
              <div key={req.id} className="card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-roar-sky">#{req.request_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[req.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[req.status] || req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {total > 0 && ` · ${formatPrice(total)} estimado`}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <ChevronDown size={16} className={`transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expandedId === req.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                    <div className="space-y-2">
                      {req.items?.map((item: any, idx: number) => (
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
                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-roar-graphite text-sm mt-3">
                      <span>Total estimado</span>
                      <span className="text-roar-sky">{formatPrice(total)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
