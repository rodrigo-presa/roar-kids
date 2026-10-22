import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ShoppingBag, Check, AlertCircle, Minus, Plus } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/utils'
import type { ProductVariant, Color, Size } from '../types'
import { toast } from 'sonner'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(slug!)
  const { addItem, openCart } = useCart()
  const { isWholesale } = useAuth()

  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-roar-graphite mb-2">Producto no encontrado</h2>
        <p className="text-gray-400 mb-6">Este producto no existe o fue removido.</p>
        <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
      </div>
    )
  }

  // Extraer colores y talles únicos
  const colors = [...new Map(
    product.variants?.map(v => v.color).filter(Boolean).map(c => [c!.id, c!]) ?? []
  ).values()]

  const sizes = [...new Map(
    product.variants?.map(v => v.size).filter(Boolean).map(s => [s!.id, s!]) ?? []
  ).values()].sort((a, b) => a.sort_order - b.sort_order)

  // Variante seleccionada
  const selectedVariant: ProductVariant | undefined = product.variants?.find(v =>
    (!selectedColor || v.color_id === selectedColor.id) &&
    (!selectedSize || v.size_id === selectedSize.id)
  )

  const availableStock = selectedVariant?.stock ?? 0
  const isOutOfStock = availableStock === 0

  // ¿Un talle está disponible con el color seleccionado?
  const isSizeAvailable = (size: Size) => {
    if (!selectedColor) {
      return product.variants?.some(v => v.size_id === size.id && v.stock > 0) ?? false
    }
    return product.variants?.some(v => v.color_id === selectedColor.id && v.size_id === size.id && v.stock > 0) ?? false
  }

  const isColorAvailable = (color: Color) =>
    product.variants?.some(v => v.color_id === color.id && v.stock > 0) ?? false

  const handleAddToCart = () => {
    if (!selectedColor && colors.length > 1) {
      toast.error('Seleccioná un color')
      return
    }
    if (!selectedSize && sizes.length > 1) {
      toast.error('Seleccioná un talle')
      return
    }
    if (!selectedVariant) {
      toast.error('Seleccioná una variante válida')
      return
    }
    if (isOutOfStock) {
      toast.error('Esta variante está agotada')
      return
    }

    const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0]
    const price = isWholesale && product.wholesale_price ? product.wholesale_price : product.retail_price

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      colorId: selectedColor?.id ?? null,
      colorName: selectedColor?.name ?? null,
      colorHex: selectedColor?.hex_code ?? null,
      sizeId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      price,
      quantity,
      imageUrl: primaryImage?.url ?? null,
      maxStock: availableStock,
    })

    toast.success('Agregado al carrito', {
      description: `${product.name}${selectedColor ? ` — ${selectedColor.name}` : ''}${selectedSize ? ` / ${selectedSize.name}` : ''}`,
      action: {
        label: 'Ver carrito',
        onClick: openCart,
      },
    })

    setQuantity(1)
  }

  const images = product.images ?? []
  const activeImage = images[activeImageIndex]
  const price = isWholesale && product.wholesale_price ? product.wholesale_price : product.retail_price

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-roar-orange transition-colors mb-8">
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galería */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-roar-beige mb-3">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.alt_text || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImageIndex ? 'border-roar-orange' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              to={`/catalogo/${product.category.slug}`}
              className="text-xs font-semibold text-roar-orange uppercase tracking-wider mb-3 hover:underline w-fit"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-roar-graphite mb-4">{product.name}</h1>

          {/* Precio */}
          <div className="mb-6">
            <p className="text-3xl font-extrabold text-roar-graphite">{formatPrice(price)}</p>
            {isWholesale && product.wholesale_price && product.wholesale_price < product.retail_price && (
              <p className="text-sm text-gray-400 line-through mt-0.5">{formatPrice(product.retail_price)}</p>
            )}
            {isWholesale && (
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-roar-sky/30 text-roar-graphite">
                Precio mayorista
              </span>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Selector de color */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-roar-graphite mb-3">
                Color{selectedColor ? `: ${selectedColor.name}` : ''}
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map(color => {
                  const available = isColorAvailable(color)
                  const isSelected = selectedColor?.id === color.id
                  return (
                    <button
                      key={color.id}
                      onClick={() => { if (available) { setSelectedColor(isSelected ? null : color); setSelectedSize(null) } }}
                      disabled={!available}
                      title={color.name}
                      className={`w-9 h-9 rounded-full transition-all ${
                        !available ? 'opacity-30 cursor-not-allowed' :
                        isSelected ? 'ring-2 ring-offset-2 ring-roar-orange scale-110' :
                        'ring-1 ring-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex_code || '#ccc' }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Selector de talle */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-roar-graphite mb-3">
                Talle{selectedSize ? `: ${selectedSize.name}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const available = isSizeAvailable(size)
                  const isSelected = selectedSize?.id === size.id
                  return (
                    <button
                      key={size.id}
                      onClick={() => { if (available) setSelectedSize(isSelected ? null : size) }}
                      disabled={!available}
                      className={`min-w-[44px] px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        !available
                          ? 'border-gray-100 text-gray-300 bg-white cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-roar-orange bg-brand-light text-roar-orange'
                          : 'border-gray-200 text-roar-graphite hover:border-roar-orange hover:text-roar-orange bg-white'
                      }`}
                    >
                      {size.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Disponibilidad */}
          {selectedVariant && (
            <div className="flex items-center gap-2 mb-5">
              {isOutOfStock ? (
                <>
                  <AlertCircle size={15} className="text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Agotado</span>
                </>
              ) : availableStock <= 3 ? (
                <>
                  <AlertCircle size={15} className="text-roar-yellow" />
                  <span className="text-sm text-amber-600 font-medium">Últimas unidades</span>
                </>
              ) : (
                <>
                  <Check size={15} className="text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Disponible</span>
                </>
              )}
            </div>
          )}

          {/* Cantidad */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-roar-graphite">Cantidad:</span>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-roar-graphite hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-roar-graphite hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Botón agregar */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock && !!selectedVariant}
            className="btn-primary w-full py-3.5 text-base"
          >
            <ShoppingBag size={20} />
            {isOutOfStock && selectedVariant ? 'Agotado' : 'Agregar al carrito'}
          </button>

        </div>
      </div>
    </div>
  )
}
