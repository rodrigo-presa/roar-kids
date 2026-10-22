import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Save, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  // Address fields
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Buenos Aires')
  const [postalCode, setPostalCode] = useState('')

  const PROVINCES = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ]

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setPhone(profile.phone ?? '')
    // Load address from profile metadata if stored
    const meta = (profile as any).default_address
    if (meta) {
      setAddress(meta.address ?? '')
      setCity(meta.city ?? '')
      setProvince(meta.province ?? 'Buenos Aires')
      setPostalCode(meta.postal_code ?? '')
    }
  }, [profile])

  if (!user) {
    navigate('/ingresar', { state: { from: '/perfil' } })
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          default_address: address.trim() ? {
            address: address.trim(),
            city: city.trim(),
            province,
            postal_code: postalCode.trim(),
          } : null,
        })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
      toast.success('Perfil actualizado')
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-roar-orange/10 flex items-center justify-center">
          <User size={22} className="text-roar-orange" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-roar-graphite">Mi perfil</h1>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Datos personales */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-roar-graphite mb-4">Datos personales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-roar-graphite mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-roar-graphite mb-1.5">WhatsApp / Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input"
                placeholder="011 1234-5678"
              />
            </div>
          </div>
        </div>

        {/* Dirección por defecto */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-roar-graphite mb-1">Dirección de envío por defecto</h2>
          <p className="text-xs text-gray-400 mb-4">Se completa automáticamente en el checkout.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-roar-graphite mb-1.5">Calle y número</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input"
                placeholder="Ej: Av. Corrientes 1234"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="input"
                  placeholder="Buenos Aires"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Código postal</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="input"
                  placeholder="1414"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-roar-graphite mb-1.5">Provincia</label>
              <select value={province} onChange={e => setProvince(e.target.value)} className="input">
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Guardar cambios</>}
        </button>
      </div>
    </div>
  )
}
