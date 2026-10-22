import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-roar-graphite text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Marca */}
          <div className="lg:col-span-1">
            <img src="/logo.png" alt="ROAR!" className="h-12 w-12 rounded-full object-cover mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Ropa de bebés, niños y teens con estilo y alegría. Diseños únicos para que brillen.
            </p>
            <a
              href="https://instagram.com/roarkidsind"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Heart size={16} />
              @roarkidsind
            </a>
          </div>

          {/* Catálogo */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Catálogo</h4>
            <ul className="space-y-2">
              {[
                { label: 'Bebés', path: '/catalogo/bebes' },
                { label: 'Niños', path: '/catalogo/ninos' },
                { label: 'Teens', path: '/catalogo/teens' },
                { label: 'Todo', path: '/catalogo' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Información</h4>
            <ul className="space-y-2">
              {[
                { label: 'Envíos y plazos', path: '/envios' },
                { label: 'Cambios y devoluciones', path: '/cambios' },
                { label: 'Medios de pago', path: '/pagos' },
                { label: 'Preguntas frecuentes', path: '/faq' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mayoristas */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Mayoristas</h4>
            <p className="text-sm text-gray-400 mb-4">
              ¿Tenés una tienda o revendés ropa? Accedé a precios especiales y condiciones exclusivas.
            </p>
            <Link
              to="/mayoristas"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-roar-sky text-roar-graphite text-sm font-semibold hover:bg-roar-sky/80 transition-colors"
            >
              Quiero ser mayorista
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ROAR! Kids. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Hecho con <Heart size={11} className="text-roar-orange fill-current" /> en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
