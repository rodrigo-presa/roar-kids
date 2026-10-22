import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, ChevronDown, LogOut, Settings, Package, Search, UserCircle, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const categories = [
  { name: 'Bebés', slug: 'bebes' },
  { name: 'Niños', slug: 'ninos' },
  { name: 'Teens', slug: 'teens' },
]

export default function Navbar() {
  const { user, profile, signOut, isAdmin, isWholesale } = useAuth()
  const { itemCount, openCart } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-roar-cream/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="ROAR!" className="h-10 w-auto" />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/catalogo"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-roar-orange bg-brand-light' : 'text-roar-graphite hover:bg-gray-100'
                }`
              }
            >
              Todo
            </NavLink>
            {categories.map(cat => (
              <NavLink
                key={cat.slug}
                to={`/catalogo/${cat.slug}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-roar-orange bg-brand-light' : 'text-roar-graphite hover:bg-gray-100'
                  }`
                }
              >
                {cat.name}
              </NavLink>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">

            {/* Mayoristas CTA */}
            {!isWholesale && !isAdmin && (
              <Link
                to="/mayoristas"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-roar-sky text-xs font-semibold text-roar-graphite hover:bg-roar-sky/20 transition-colors"
              >
                ¿Sos revendedora?
              </Link>
            )}

            {/* Search */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 rounded-lg text-roar-graphite hover:bg-gray-100 transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* Carrito */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-roar-graphite hover:bg-gray-100 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] px-0.5 bg-roar-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Usuario */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 p-2 rounded-lg text-roar-graphite hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-roar-orange text-white text-xs font-bold flex items-center justify-center">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <p className="text-sm font-semibold text-roar-graphite truncate">
                          {profile?.full_name || 'Mi cuenta'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {isWholesale && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-roar-sky/30 text-roar-graphite">
                            Mayorista
                          </span>
                        )}
                        {isAdmin && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-roar-orange/20 text-roar-orange">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-roar-graphite hover:bg-gray-50 transition-colors"
                      >
                        <UserCircle size={15} /> Mi perfil
                      </Link>
                      <Link
                        to="/mis-pedidos"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-roar-graphite hover:bg-gray-50 transition-colors"
                      >
                        <Package size={15} /> Mis pedidos
                      </Link>
                      {isWholesale && (
                        <Link
                          to="/mayoristas/panel"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-roar-graphite hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={15} /> Panel mayorista
                        </Link>
                      )}
                      {isWholesale && (
                        <Link
                          to="/mayoristas/solicitudes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-roar-graphite hover:bg-gray-50 transition-colors"
                        >
                          <ClipboardList size={15} /> Mis solicitudes
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-roar-orange hover:bg-brand-light transition-colors"
                        >
                          <Settings size={15} /> Panel admin
                        </Link>
                      )}
                      <div className="border-t border-gray-50 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/ingresar" className="flex items-center gap-1.5 p-2 rounded-lg text-roar-graphite hover:bg-gray-100 transition-colors">
                <User size={20} />
              </Link>
            )}

            {/* Hamburguesa mobile */}
            <button
              className="md:hidden p-2 rounded-lg text-roar-graphite hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white animate-slide-in">
          <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 outline-none text-sm text-roar-graphite placeholder-gray-400 bg-transparent"
            />
            <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-gray-400 hover:text-roar-graphite transition-colors">
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-in">
          <nav className="px-4 py-3 space-y-1">
            <NavLink to="/catalogo" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-roar-graphite hover:bg-gray-50">
              Todo el catálogo
            </NavLink>
            {categories.map(cat => (
              <NavLink key={cat.slug} to={`/catalogo/${cat.slug}`} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-roar-graphite hover:bg-gray-50">
                {cat.name}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link to="/mayoristas" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-roar-graphite hover:bg-roar-sky/20">
                ¿Sos revendedora? → Mayoristas
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
