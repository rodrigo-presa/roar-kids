import { useState, useEffect } from 'react'
import { X, Ruler } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'bebes' | 'ninos' | 'teens'

const BEBES = [
  { talle: '0M',  altura: '50-56', pecho: '40', largo: '28' },
  { talle: '3M',  altura: '56-62', pecho: '42', largo: '30' },
  { talle: '6M',  altura: '62-68', pecho: '44', largo: '32' },
  { talle: '12M', altura: '68-80', pecho: '47', largo: '35' },
  { talle: '18M', altura: '80-86', pecho: '49', largo: '37' },
  { talle: '24M', altura: '86-92', pecho: '51', largo: '39' },
]

const NINOS = [
  { talle: '2', altura: '86-92',   pecho: '53', cintura: '50' },
  { talle: '3', altura: '92-98',   pecho: '55', cintura: '51' },
  { talle: '4', altura: '98-104',  pecho: '57', cintura: '52' },
  { talle: '5', altura: '104-110', pecho: '59', cintura: '53' },
  { talle: '6', altura: '110-116', pecho: '62', cintura: '54' },
  { talle: '8', altura: '116-128', pecho: '66', cintura: '56' },
]

const TEENS = [
  { talle: '10', pecho: '70', largo: '55', cintura: '58' },
  { talle: '12', pecho: '74', largo: '58', cintura: '61' },
  { talle: '14', pecho: '78', largo: '61', cintura: '64' },
  { talle: '16', pecho: '82', largo: '64', cintura: '67' },
]

const TABS: { id: Tab; label: string }[] = [
  { id: 'bebes', label: 'Bebés (0-24M)' },
  { id: 'ninos', label: 'Niños (2-8)' },
  { id: 'teens', label: 'Teens (10-16)' },
]

export function SizeGuideModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('bebes')

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Ruler size={18} className="text-roar-orange" />
            <h2 className="text-base font-bold text-roar-graphite">Guía de talles</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-5 pt-4 pb-2 flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-roar-orange text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="overflow-y-auto px-5 pb-2 flex-1">
          {activeTab === 'bebes' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-2.5 text-left font-semibold text-roar-graphite">Talle</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Altura (cm)</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Pecho (cm)</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Largo (cm)</th>
                </tr>
              </thead>
              <tbody>
                {BEBES.map((r, i) => (
                  <tr key={r.talle} className={i % 2 === 0 ? '' : 'bg-gray-50/80'}>
                    <td className="py-2.5 font-bold text-roar-orange">{r.talle}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.altura}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.pecho}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.largo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'ninos' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-2.5 text-left font-semibold text-roar-graphite">Talle</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Altura (cm)</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Pecho (cm)</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Cintura (cm)</th>
                </tr>
              </thead>
              <tbody>
                {NINOS.map((r, i) => (
                  <tr key={r.talle} className={i % 2 === 0 ? '' : 'bg-gray-50/80'}>
                    <td className="py-2.5 font-bold text-roar-orange">{r.talle}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.altura}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.pecho}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.cintura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'teens' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-2.5 text-left font-semibold text-roar-graphite">Talle</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Pecho (cm)</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Largo remera</th>
                  <th className="py-2.5 text-center font-semibold text-roar-graphite">Cintura (cm)</th>
                </tr>
              </thead>
              <tbody>
                {TEENS.map((r, i) => (
                  <tr key={r.talle} className={i % 2 === 0 ? '' : 'bg-gray-50/80'}>
                    <td className="py-2.5 font-bold text-roar-orange">{r.talle}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.pecho}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.largo}</td>
                    <td className="py-2.5 text-center text-gray-600">{r.cintura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tip */}
        <div className="mx-5 mb-5 mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex-shrink-0">
          <p className="text-xs text-roar-graphite/80 leading-relaxed">
            💡 <span className="font-semibold">¿Dudás entre dos talles?</span> Te recomendamos elegir el talle más grande para mayor comodidad y que la prenda les dure más tiempo.
          </p>
        </div>
      </div>
    </div>
  )
}
