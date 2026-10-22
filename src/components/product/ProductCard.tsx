import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import type { Product } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { isWholesale } = useAuth()

  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0
  const isOutOfStock = totalStock === 0
  const lowStock = !isOutOfStock && totalStock <= 3
  // Producto nuevo si fue creado en los últimos 14 días
  const isNew = !isOutOfStock && !lowStock && (() => {
    if (!product.created_at) return false
    const created = new Date(product.created_at)
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 14
  })()


  return (
    <Link to={`/producto/${product.slug}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Imagen */}
        <div className="relative aspect-[3/4] bg-roar-beige overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-700/90 text-white backdrop-blur-sm">
                Agotado
              </span>
            ) : lowStock ? (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-amber-500/90 text-white backdrop-blur-sm">
                Últimas unidades
              </span>
            ) : isNew ? (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-roar-orange/90 text-white backdrop-blur-sm">
                Nuevo
              </span>
            ) : null}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-roar-graphite/0 group-hover:bg-roar-graphite/5 transition-colors duration-300" />
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-roar-graphite leading-tight truncate mb-2">
            {product.name}
          </h3>

          {/* Swatches de color */}
          {product.variants && product.variants.length > 0 && (() => {
            const uniqueColors = [...new Map(product.variants.map(v => [v.color_id, v.color])).values()].filter(Boolean)
            return uniqueColors.length > 1 ? (
              <div className="flex items-center gap-1 mb-2">
                {uniqueColors.slice(0, 6).map(color => color && (
                  <span
                    key={color.id}
                    title={color.name}
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 flex-shrink-0"
                    style={{ backgroundColor: color.hex_code || '#ccc' }}
                  />
                ))}
                {uniqueColors.length > 6 && (
                  <span className="text-[10px] text-gray-400 font-medium">+{uniqueColors.length - 6}</span>
                )}
              </div>
            ) : null
          })()}

          <div className="flex items-end justify-between mt-1">
            <div>
              <p className="text-base font-bold text-roar-graphite">
                {formatPrice(product.retail_price)}
              </p>
              {isWholesale && product.wholesale_price && (
                <p className="text-xs font-semibold text-roar-sky">
                  Mayor: {formatPrice(product.wholesale_price)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
