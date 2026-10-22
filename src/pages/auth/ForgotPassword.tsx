import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, ArrowLeft, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    })
    setLoading(false)
    if (error) {
      toast.error('No se pudo enviar el email. Verificá la dirección.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/ingresar" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-roar-graphite mb-8">
          <ArrowLeft size={15} /> Volver al inicio
        </Link>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-roar-graphite mb-2">¡Email enviado!</h2>
            <p className="text-sm text-gray-400 mb-6">
              Revisá tu bandeja de entrada en <span className="font-medium text-roar-graphite">{email}</span> y seguí el link para crear una nueva contraseña.
            </p>
            <Link to="/ingresar" className="btn-primary w-full text-sm py-2.5">
              Volver al login
            </Link>
          </div>
        ) : (
          <div className="card p-8">
            <div className="w-12 h-12 rounded-2xl bg-roar-sky/20 flex items-center justify-center mb-5">
              <Mail size={20} className="text-roar-graphite" />
            </div>
            <h1 className="text-xl font-bold text-roar-graphite mb-1">Recuperar contraseña</h1>
            <p className="text-sm text-gray-400 mb-6">
              Ingresá tu email y te mandamos un link para crear una nueva contraseña.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enviar link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
