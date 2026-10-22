import { useState } from 'react'
import { Search, Check, X, ChevronDown, ExternalLink } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

type Application = {
  id: string
  created_at: string
  user_id: string
  business_name: string
  cuit: string
  phone: string
  city: string
  province: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  profile?: { full_name: string; email: string }
}

const statusColors: Record<string, string> = {
  pending: 'bg-roar-yellow/30 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}
const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

export default function AdminWholesale() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-wholesale-apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wholesale_applications')
        .select('*, profile:profiles(full_name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Application[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ appId, userId, status }: { appId: string; userId: string; status: 'approved' | 'rejected' }) => {
      // Update application status
      const { error: appErr } = await supabase
        .from('wholesale_applications')
        .update({ status })
        .eq('id', appId)
      if (appErr) throw appErr

      // If approved, update the user's profile role and wholesale_status
      if (status === 'approved') {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ role: 'wholesale', wholesale_status: 'approved' })
          .eq('id', userId)
        if (profileErr) throw profileErr
      } else {
        // If rejected, update wholesale_status to rejected
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ wholesale_status: 'rejected' })
          .eq('id', userId)
        if (profileErr) throw profileErr
      }
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin-wholesale-apps'] })
      toast.success(status === 'approved' ? '¡Mayorista aprobada!' : 'Solicitud rechazada')
    },
    onError: () => {
      toast.error('No se pudo actualizar el estado')
    },
  })

  const filtered = applications?.filter(a => {
    const matchesSearch =
      a.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = applications?.filter(a => a.status === 'pending').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-roar-graphite">Mayoristas</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-roar-orange mt-0.5">{pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por negocio, nombre o ciudad..."
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Negocio</th>
                <th className="px-5 py-3 text-left font-medium">Contacto</th>
                <th className="px-5 py-3 text-left font-medium">Ubicación</th>
                <th className="px-5 py-3 text-left font-medium">CUIT</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
                <th className="px-5 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
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
                    {search || filterStatus !== 'all' ? 'Sin resultados' : 'Todavía no hay solicitudes'}
                  </td>
                </tr>
              ) : (
                filtered?.map(app => (
                  <>
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-roar-graphite">{app.business_name}</p>
                        <p className="text-xs text-gray-400">{app.profile?.full_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-600">{app.profile?.email}</p>
                        {app.phone && (
                          <a
                            href={`https://wa.me/${app.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-roar-sky hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {app.phone} <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {[app.city, app.province].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{app.cuit || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                          {statusLabels[app.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {new Date(app.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus.mutate({ appId: app.id, userId: app.user_id, status: 'approved' })}
                                disabled={updateStatus.isPending}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors"
                                title="Aprobar"
                              >
                                <Check size={13} /> Aprobar
                              </button>
                              <button
                                onClick={() => updateStatus.mutate({ appId: app.id, userId: app.user_id, status: 'rejected' })}
                                disabled={updateStatus.isPending}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                                title="Rechazar"
                              >
                                <X size={13} /> Rechazar
                              </button>
                            </>
                          )}
                          {app.message && (
                            <button
                              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                              className="text-xs text-gray-400 hover:text-roar-graphite"
                              title="Ver mensaje"
                            >
                              <ChevronDown size={15} className={`transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === app.id && app.message && (
                      <tr key={`${app.id}-msg`} className="bg-roar-beige/20">
                        <td colSpan={7} className="px-5 py-3">
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold text-roar-graphite">Mensaje: </span>
                            {app.message}
                          </p>
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
