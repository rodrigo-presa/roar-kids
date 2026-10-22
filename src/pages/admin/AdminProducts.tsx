import { useState } from 'react'
import { Plus, Search, Edit2, Eye, EyeOff, Star } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import type { Product } from '../../types'
import { toast } from 'sonner'

export default function AdminProducts() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Product[]
    },
  })

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from('products').update({ is_published: !is_published }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Producto actualizado')
    },
  })

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from('products').update({ featured: !featured }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Producto actualizado')
    },
  })

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-roar-graphite">Productos</h1>
        <button onClick={() => navigate('/admin/productos/nuevo')} className="btn-primary text-sm gap-2">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          className="input pl-10"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Producto</th>
                <th className="px-5 py-3 text-left font-medium">Categoría</th>
                <th className="px-5 py-3 text-left font-medium">Precio minorista</th>
                <th className="px-5 py-3 text-left font-medium">Precio mayorista</th>
                <th className="px-5 py-3 text-left font-medium">Stock total</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-left font-medium">Acciones</th>
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
                    {search ? 'Sin resultados' : 'Todavía no hay productos. ¡Creá el primero!'}
                  </td>
                </tr>
              ) : (
                filtered?.map(product => {
                  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0
                  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-roar-beige flex-shrink-0">
                            {primaryImage ? (
                              <img src={primaryImage.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Plus size={14} />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-roar-graphite">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{product.category?.name || '—'}</td>
                      <td className="px-5 py-4 font-semibold">{formatPrice(product.retail_price)}</td>
                      <td className="px-5 py-4 text-roar-sky font-semibold">
                        {product.wholesale_price ? formatPrice(product.wholesale_price) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${totalStock === 0 ? 'text-red-500' : totalStock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                          {totalStock} uds.
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {product.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePublish.mutate({ id: product.id, is_published: product.is_published })}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-roar-graphite transition-colors"
                            title={product.is_published ? 'Despublicar' : 'Publicar'}
                          >
                            {product.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => toggleFeatured.mutate({ id: product.id, featured: product.featured })}
                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${product.featured ? 'text-roar-yellow' : 'text-gray-300 hover:text-roar-yellow'}`}
                            title="Destacado"
                          >
                            <Star size={15} className={product.featured ? 'fill-current' : ''} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/productos/${product.id}`)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-roar-graphite transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
