import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Tag, Truck, MessageCircle, Loader2, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const benefits = [
  { icon: Tag, title: 'Precios mayoristas', desc: 'Accedé a precios especiales solo para revendedoras.' },
  { icon: Truck, title: 'Pedidos por volumen', desc: 'Armá tu pedido y coordinamos el envío juntas.' },
  { icon: MessageCircle, title: 'Atención personalizada', desc: 'Coordinamos todo por WhatsApp de forma directa.' },
  { icon: Lock, title: 'Acceso exclusivo', desc: 'Precios privados, protegidos y siempre actualizados.' },
]

export default function WholesaleLanding() {
  const { user, isWholesale, profile } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const [form, setForm] = useState({
    business_name: '',
    cuit: '',
    phone: '',
    city: '',
    province: 'Buenos Aires',
    message: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // Si ya es mayorista aprobado, redirigir al panel
  if (isWholesale) {
    navigate('/mayoristas/panel')
    return null
  }

  const handleApply = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Necesitás registrarte primero')
      navigate('/registrarse', { state: { from: '/mayoristas' } })
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('wholesale_applications')
      .insert({
        user_id: user.id,
        ...form,
      })
    setLoading(false)

    if (error) {
      toast.error('No se pudo enviar la solicitud. Intentá de nuevo.')
      return
    }

    setSent(true)
    toast.success('¡Solicitud enviada! Te contactamos a la brevedad.')
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-roar-graphite text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-roar-sky/20 text-roar-sky text-xs font-semibold mb-4 uppercase tracking-wider">
            Canal mayorista
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            ¿Sos revendedora o<br />tenés una tienda?
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
            Accedé al catálogo mayorista de ROAR! con precios especiales y condiciones exclusivas para revendedoras.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              profile?.wholesale_status === 'pending' ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-roar-yellow/20 text-roar-yellow font-semibold text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Tu solicitud está en revisión
                </div>
              ) : (
                <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-roar-orange text-white font-bold text-sm hover:bg-brand-hover transition-colors">
                  Quiero ser mayorista
                </button>
              )
            ) : (
              <>
                <Link to="/registrarse" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-roar-orange text-white font-bold text-sm hover:bg-brand-hover transition-colors">
                  Crear cuenta y aplicar
                </Link>
                <Link to="/ingresar" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-roar-graphite text-center mb-10">¿Por qué trabajar con ROAR!?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-roar-sky/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-roar-graphite" />
                </div>
                <h3 className="text-sm font-semibold text-roar-graphite mb-2">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de solicitud */}
      {(showForm && !sent) && (
        <section className="py-16 bg-roar-beige/40 px-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-roar-graphite text-center mb-2">Completá tu solicitud</h2>
            <p className="text-gray-400 text-center text-sm mb-8">
              Revisamos tu solicitud y te contactamos en menos de 24 horas.
            </p>
            <form onSubmit={handleApply} className="card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Nombre del negocio</label>
                <input type="text" value={form.business_name} onChange={e => update('business_name', e.target.value)} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">CUIT</label>
                  <input type="text" value={form.cuit} onChange={e => update('cuit', e.target.value)} className="input" placeholder="20-12345678-9" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input" placeholder="011 1234-5678" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Ciudad</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-roar-graphite mb-1.5">Provincia</label>
                  <input type="text" value={form.province} onChange={e => update('province', e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Mensaje (opcional)</label>
                <textarea value={form.message} onChange={e => update('message', e.target.value)} className="input h-24 resize-none" placeholder="Contanos un poco sobre tu negocio..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </section>
      )}

      {sent && (
        <section className="py-16 px-4 text-center">
          <div className="max-w-md mx-auto">
            <Check size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-roar-graphite mb-3">¡Solicitud enviada!</h2>
            <p className="text-gray-400">
              Revisamos tu solicitud y te contactamos en menos de 24 horas por WhatsApp.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
