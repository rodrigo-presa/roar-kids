import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error('Credenciales incorrectas. Revisá tu email y contraseña.')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ROAR!" className="h-14 w-14 mx-auto mb-4 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-roar-graphite">Bienvenida de vuelta</h1>
          <p className="text-gray-400 text-sm mt-1">Ingresá para ver tus pedidos y comprar</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-roar-graphite mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-roar-graphite mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-roar-graphite"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/olvide-contrasena" className="text-xs text-gray-400 hover:text-roar-orange transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/registrarse" className="text-roar-orange font-semibold hover:underline">
            Registrate gratis
          </Link>
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          ¿Sos mayorista?{' '}
          <Link to="/mayoristas" className="text-roar-orange font-semibold hover:underline">
            Accedé acá
          </Link>
        </p>
      </div>
    </div>
  )
}
