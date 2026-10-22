import { useEffect, useState } from 'react'
import { ShoppingCart, TrendingUp, Users, AlertTriangle, Package, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import type { Order } from '../../types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders_today: 0,
    orders_pending: 0,
    revenue_month: 0,
    wholesale_pending: 0,
    low_stock: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const [
        { count: ordersToday },
        { count: ordersPending },
        { data: revenueData },
        { count: wholesalePending },
        { count: lowStock },
        { data: recent },
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total').eq('payment_status', 'approved').gte('created_at', monthStart),
        supabase.from('wholesale_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('product_variants').select('id', { count: 'exact', head: true }).lte('stock', 3).gt('stock', 0),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const revenue = revenueData?.reduce((acc, o) => acc + (o.total || 0), 0) ?? 0

      setStats({
        orders_today: ordersToday ?? 0,
        orders_pending: ordersPending ?? 0,
        revenue_month: revenue,
        wholesale_pending: wholesalePending ?? 0,
        low_stock: lowStock ?? 0,
      })
      setRecentOrders(recent as Order[] ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { icon: ShoppingCart, label: 'Pedidos hoy', value: stats.orders_today, color: 'bg-roar-sky/20 text-roar-graphite' },
    { icon: Clock, label: 'Pedidos pendientes', value: stats.orders_pending, color: 'bg-roar-yellow/30 text-roar-graphite', alert: stats.orders_pending > 0 },
    { icon: TrendingUp, label: 'Ventas del mes', value: formatPrice(stats.revenue_month), color: 'bg-green-100 text-green-700', isRevenue: true },
    { icon: Users, label: 'Mayoristas pendientes', value: stats.wholesale_pending, color: 'bg-roar-orange/20 text-roar-orange', alert: stats.wholesale_pending > 0 },
    { icon: AlertTriangle, label: 'Stock bajo', value: stats.low_stock, color: 'bg-red-100 text-red-600', alert: stats.low_stock > 0 },
    { icon: Package, label: 'Tienda', value: 'Online', color: 'bg-roar-sage/30 text-roar-graphite' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-roar-yellow/30 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    processing: 'bg-roar-sky/30 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-100 text-red-600',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', paid: 'Pagado', processing: 'En proceso',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-roar-graphite mb-8">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, alert }) => (
          <div key={label} className={`card p-4 ${alert ? 'ring-2 ring-roar-orange/30' : ''}`}>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-extrabold text-roar-graphite">{loading ? '...' : value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-roar-graphite">Pedidos recientes</h2>
          <a href="/admin/pedidos" className="text-xs text-roar-orange hover:underline">Ver todos</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Pedido</th>
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    Todavía no hay pedidos
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-roar-orange">{order.order_number}</td>
                    <td className="px-5 py-4 text-roar-graphite">{order.buyer_name}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
