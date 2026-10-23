import { CreditCard, Landmark, Banknote, ShieldCheck } from 'lucide-react'

const methods = [
  {
    icon: <CreditCard size={28} className="text-roar-orange" />,
    title: 'Mercado Pago',
    description:
      'Pagá con tarjeta de crédito, débito o dinero en cuenta de Mercado Pago. También podés abonar en efectivo en cualquier sucursal Rapipago o Pago Fácil generando el código de pago desde la plataforma.',
    tag: 'Hasta 12 cuotas',
  },
  {
    icon: <Landmark size={28} className="text-roar-orange" />,
    title: 'Transferencia bancaria',
    description:
      'Realizá una transferencia o depósito bancario directo a nuestra cuenta. Te enviamos los datos por WhatsApp una vez confirmado tu pedido. El pedido se despacha cuando acreditamos el pago.',
    tag: 'Sin recargo',
  },
  {
    icon: <Banknote size={28} className="text-roar-orange" />,
    title: 'Efectivo (CABA / GBA)',
    description:
      'Para pedidos con entrega en zona CABA o GBA podés abonar en efectivo al momento de la entrega. Coordinamos el método y horario por WhatsApp.',
    tag: 'Solo entrega local',
  },
]

export default function PaymentMethods() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-roar-graphite mb-2">Medios de pago</h1>
      <p className="text-gray-500 mb-10">
        Elegí el método que más te convenga. En todos los casos coordinamos los detalles por WhatsApp
        una vez que confirmás tu pedido.
      </p>

      <div className="space-y-5">
        {methods.map((m, i) => (
          <div key={i} className="flex gap-5 p-5 border border-gray-200 rounded-2xl bg-white hover:shadow-sm transition-shadow">
            <div className="shrink-0 mt-0.5">{m.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="font-semibold text-roar-graphite">{m.title}</h2>
                <span className="text-xs font-medium bg-roar-orange/10 text-roar-orange px-2 py-0.5 rounded-full">
                  {m.tag}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-start gap-3 bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <ShieldCheck size={22} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-roar-graphite text-sm mb-1">Compra segura</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tus datos están protegidos. Procesamos los pagos a través de Mercado Pago, plataforma
            certificada con los más altos estándares de seguridad. Nunca compartimos tu información
            con terceros.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-3">¿Tenés una consulta sobre tu pago?</p>
        <a
          href="https://wa.me/5491124061807?text=Hola%2C%20tengo%20una%20consulta%20sobre%20medios%20de%20pago%20en%20ROAR!%20Kids"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1ebe5b] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultanos por WhatsApp
        </a>
      </div>
    </div>
  )
}
