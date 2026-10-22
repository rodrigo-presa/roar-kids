import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name'

export default function Catalog() {
  const { categorySlug } = useParams<{ categorySlug?: string }>()
  const [searchParams] = useSearchParams()
  const { data: products, isLoading, error } = useProducts(categorySlug)
  const { data: categories } = useCategories()
  const [sort, setSort] = useState<SortOption>('newest')
  const [filterColors, setFilterColors] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')

  // Sync search query from URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const currentCategory = categories?.find(c => c.slug === categorySlug)

  // Colores disponibles en los productos
  const availableColors = products
    ? [...new Map(
        products.flatMap(p => p.variants?.map(v => v.color).filter(Boolean) ?? [])
          .map(c => [c!.id, c!])
      ).values()]
    : []

  // Filtro + ordenamiento
  const filtered = products
    ?.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      }
      if (filterColors.length === 0) return true
      return p.variants?.some(v => v.color && filterColors.includes(v.color.id)) ?? false
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.retail_price - b.retail_price
      if (sort === 'price-desc') return b.retail_price - a.retail_price
      if (sort === 'name') return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const toggleColor = (id: string) =>
    setFilterColors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : (currentCategory?.name ?? 'Todo el catálogo')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-roar-graphite">{title}</h1>
          {!isLoading && (
            <p className="text-sm text-gray-400 mt-1">
              {filtered?.length ?? 0} {filtered?.length === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">Ordenar por:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="input py-1.5 w-auto text-sm"
          >
            <option value="newest">Más nuevos</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="name">Nombre A–Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtros */}
        {availableColors.length > 0 && (
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-roar-graphite flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Filtros
                </h3>
                {filterColors.length > 0 && (
                  <button
                    onClick={() => setFilterColors([])}
                    className="text-xs text-roar-orange hover:underline flex items-center gap-0.5"
                  >
                    <X size={11} /> Limpiar
                  </button>
                )}
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Colores</p>
              <div className="space-y-2">
                {availableColors.map(color => (
                  <label key={color.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filterColors.includes(color.id)}
                      onChange={() => toggleColor(color.id)}
                      className="sr-only"
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                        filterColors.includes(color.id)
                          ? 'border-roar-orange scale-110 shadow-md'
                          : 'border-white shadow ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex_code || '#ccc' }}
                    />
                    <span className="text-sm text-roar-graphite group-hover:text-roar-orange transition-colors">
                      {color.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {error ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Ocurrió un error al cargar los productos.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🕵️</div>
              <h3 className="text-lg font-semibold text-roar-graphite mb-2">
                {filterColors.length > 0 ? 'Sin resultados con estos filtros' : 'No hay productos todavía'}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {filterColors.length > 0
                  ? 'Probá con otros colores o limpiá los filtros.'
                  : 'Pronto vamos a tener novedades en esta categoría.'}
              </p>
              {filterColors.length > 0 && (
                <button onClick={() => setFilterColors([])} className="btn-secondary text-sm">
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
