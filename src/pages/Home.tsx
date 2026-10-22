import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RefreshCw, Shield, Star } from 'lucide-react'
import { useFeaturedProducts } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'

const categories = [
  {
    name: 'Bebés',
    slug: 'bebes',
    description: '0 a 24 meses',
    color: 'from-roar-beige to-roar-beige/50',
    emoji: '🍼',
  },
  {
    name: 'Niños',
    slug: 'ninos',
    description: '2 a 10 años',
    color: 'from-roar-sky/40 to-roar-sky/10',
    emoji: '🌟',
  },
  {
    name: 'Teens',
    slug: 'teens',
    description: '10 a 16 años',
    color: 'from-roar-yellow/40 to-roar-yellow/10',
    emoji: '🔥',
  },
]

const benefits = [
  { icon: Truck, title: 'Envíos a todo el país', desc: 'Por Correo Argentino a tu puerta' },
  { icon: RefreshCw, title: 'Cambios sin drama', desc: '30 días para cambiar talle o color' },
  { icon: Shield, title: 'Compra segura', desc: 'Pagá con Mercado Pago con total confianza' },
  { icon: Star, title: 'Calidad garantizada', desc: 'Prendas duraderas y cómodas para cada etapa' },
]

export default function Home() {
  const { data: featured, isLoading } = useFeaturedProducts()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-roar-beige via-roar-cream to-roar-sky/20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-roar-orange/10 text-roar-orange text-xs font-semibold mb-4 uppercase tracking-wider">
                Nueva colección
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-roar-graphite leading-tight mb-6">
                Ropa con
                <span className="text-roar-orange"> alegría</span>
                <br />para cada etapa
              </h1>
              <p className="text-lg text-gray-500 max-w-md mb-8 mx-auto md:mx-0">
                Diseños únicos para bebés, niños y teens. Calidad y estilo que se nota en cada prenda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/catalogo" className="btn-primary text-base px-7 py-3">
                  Ver catálogo
                  <ArrowRight size={18} />
                </Link>
                <Link to="/mayoristas" className="btn-secondary text-base px-7 py-3">
                  Soy revendedora
                </Link>
              </div>
            </div>

            {/* Imagen hero — cuando haya fotos reales */}
            <div className="flex-1 relative max-w-sm w-full mx-auto">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-roar-orange/20 via-roar-sky/20 to-roar-yellow/20 flex items-center justify-center shadow-xl">
                <img src="/logo.png" alt="ROAR!" className="w-40 h-40 object-contain drop-shadow-lg" />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-2.5">
                <p className="text-xs text-gray-400">Envíos a</p>
                <p className="text-sm font-bold text-roar-graphite">todo el país 🇦🇷</p>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-roar-orange rounded-2xl shadow-lg px-4 py-2.5 text-white">
                <p className="text-xs opacity-80">Colección</p>
                <p className="text-sm font-bold">2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-roar-graphite">Comprá por categoría</h2>
            <p className="text-gray-400 mt-2">Encontrá lo que buscás según la edad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/catalogo/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-8 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100`}
              >
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-xl font-bold text-roar-graphite">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-roar-orange group-hover:gap-2 transition-all">
                  Ver ropa <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destacados */}
      {(isLoading || (featured && featured.length > 0)) && (
        <section className="py-16 bg-roar-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-roar-graphite">Productos destacados</h2>
                <p className="text-gray-400 mt-1">Los favoritos de la temporada</p>
              </div>
              <Link to="/catalogo" className="btn-ghost text-sm hidden sm:flex">
                Ver todo <ArrowRight size={16} />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center mt-8 sm:hidden">
              <Link to="/catalogo" className="btn-secondary">
                Ver todo el catálogo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="py-16 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-roar-orange/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-roar-orange" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-roar-graphite">{title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner mayoristas */}
      <section className="py-16 bg-gradient-to-r from-roar-graphite to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Tenés una tienda o revendés ropa?
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-8">
            Accedé al catálogo mayorista con precios especiales y condiciones exclusivas para revendedoras.
          </p>
          <Link to="/mayoristas" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-roar-sky text-roar-graphite font-bold text-sm hover:bg-roar-sky/80 transition-colors">
            Quiero ser revendedora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
