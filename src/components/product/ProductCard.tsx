import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import type { Product } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface Props {
  product: Product
}

const categoryColors: Record<string, string> = {
  bebes: 'bg-roar-beige text-roar-graphite',
  ninos: 'bg-roar-sky/40 text-roar-graphite',
  teens: 'bg-roar-yellow/40 text-roar-graphite',
}

export default function ProductCard({ product }: Props) {
  const { isWholesale } = useAuth()

  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0
  const isOutOfStock = totalStock === 0
  const categorySlug = product.category?.slug ?? ''
  const badgeClass = categoryColors[categorySlug] || 'bg-gray-100 text-gray-600'

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
            {product.category && (
              <span className={`badge-category ${badgeClass}`}>
                {product.category.name}
              </span>
            )}
            {isOutOfStock && (
              <span className="badge-category bg-gray-700 text-white">
                Agotado
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-roar-graphite/0 group-hover:bg-roar-graphite/5 transition-colors duration-300" />
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-roar-graphite leading-tight truncate mb-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-2">
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

            {/* Colores disponibles */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-end max-w-[80px]">
                {[...new Map(product.variants.map(v => [v.color_id, v.color])).values()]
                  .filter(Boolean)
                  .slice(0, 5)
                  .map(color => color && (
                    <span
                      key={color.id}
                      title={color.name}
                      className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200 flex-shrink-0"
                      style={{ backgroundColor: color.hex_code || '#ccc' }}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
