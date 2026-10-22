import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeCart()
    if (!user) {
      navigate('/ingresar', { state: { from: '/checkout' } })
    } else {
      navigate('/checkout')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-roar-orange" />
            <h2 className="text-lg font-bold text-roar-graphite">Mi carrito</h2>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-roar-orange text-white text-xs font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-roar-beige flex items-center justify-center">
                <ShoppingBag size={32} className="text-roar-orange/50" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-roar-graphite mb-1">Tu carrito está vacío</h3>
                <p className="text-sm text-gray-400">Explorá el catálogo y sumá tus favoritos.</p>
              </div>
              <Link to="/catalogo" onClick={closeCart} className="btn-primary text-sm">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 px-5">
              {items.map(item => (
                <li key={item.variantId} className="py-4 flex gap-4">
                  {/* Imagen */}
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-roar-beige flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.productSlug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-roar-graphite hover:text-roar-orange transition-colors truncate block"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[
                        item.colorName,
                        item.sizeName && `Talle ${item.sizeName}`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-sm font-bold text-roar-orange mt-1">{formatPrice(item.price)}</p>

                    {/* Cantidad */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-roar-graphite">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-roar-graphite">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">El envío se calcula en el checkout</p>
            <button onClick={handleCheckout} className="btn-primary w-full py-3.5 text-base">
              Iniciar compra
              <ArrowRight size={18} />
            </button>
            <button onClick={closeCart} className="btn-ghost w-full text-sm">
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
