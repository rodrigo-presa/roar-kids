import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import { toast } from 'sonner'
import type { Order } from '../../types'

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const

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

export default function AdminOrders() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, variant:product_variants(*, product:products(name)))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Estado actualizado')
    },
  })

  const filtered = orders?.filter(o => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-roar-graphite">Pedidos</h1>
        <span className="text-sm text-gray-400">{filtered?.length ?? 0} pedidos</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, nombre o email..."
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Pedido</th>
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Envío</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
                <th className="px-5 py-3 text-left font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    {search || filterStatus !== 'all' ? 'Sin resultados' : 'Todavía no hay pedidos'}
                  </td>
                </tr>
              ) : (
                filtered?.map(order => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-roar-orange">{order.order_number}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-roar-graphite">{order.buyer_name}</p>
                        <p className="text-xs text-gray-400">{order.buyer_email}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{order.shipping_method || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                            className={`appearance-none pl-2.5 pr-7 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{statusLabels[s]}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="text-xs text-roar-orange hover:underline"
                        >
                          {expandedId === order.id ? 'Ocultar' : 'Ver items'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-roar-beige/20">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-roar-graphite mb-2">
                              Items del pedido · {order.shipping_city ? `${order.shipping_city}, ${order.shipping_province}` : ''}
                            </p>
                            {(order as any).items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-gray-600">
                                <span>
                                  {item.product_name} — {[item.color_name, item.size_name && `T.${item.size_name}`].filter(Boolean).join(', ')} × {item.quantity}
                                </span>
                                <span className="font-semibold">{formatPrice(item.total_price)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-bold text-roar-graphite pt-2 border-t border-gray-200">
                              <span>Envío: {formatPrice(order.shipping_cost ?? 0)}</span>
                              <span>Total: {formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
