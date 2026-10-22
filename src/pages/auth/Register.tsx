import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      toast.error(error.message || 'No se pudo crear la cuenta')
      return
    }
    toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
    navigate('/')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ROAR!" className="h-14 w-14 mx-auto mb-4 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-roar-graphite">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Registrate para comprar en ROAR!</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-roar-graphite mb-1.5">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input"
              placeholder="Tu nombre"
              required
            />
          </div>

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
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
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

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Crear cuenta'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Al registrarte aceptás los términos de uso y la política de privacidad.
          </p>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/ingresar" className="text-roar-orange font-semibold hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
