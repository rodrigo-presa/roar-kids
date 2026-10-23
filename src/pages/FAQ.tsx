import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: '¿Cómo sé qué talle elegir para mi hijo/a?',
    answer:
      'Recomendamos guiarte por la talla en centímetros. En la ficha de cada producto encontrás el botón "Guía de talles" con una tabla de medidas detallada. Si tu hijo/a está entre dos talles, siempre elegí el más grande para mayor comodidad.',
  },
  {
    question: '¿Cuánto demoran los envíos?',
    answer:
      'Los envíos se realizan por correo o transporte a todo el país. El plazo habitual es de 3 a 7 días hábiles según la localidad. Una vez despachado tu pedido te enviamos el número de seguimiento por WhatsApp.',
  },
  {
    question: '¿Hacen envíos a todo el país?',
    answer:
      'Sí, enviamos a toda Argentina. El costo de envío se calcula según la dirección de entrega y se informa al momento de cerrar el pedido.',
  },
  {
    question: '¿Cuáles son los medios de pago disponibles?',
    answer:
      'Aceptamos transferencia bancaria, Mercado Pago (tarjetas de crédito, débito y pago en efectivo) y efectivo contra entrega en zona CABA/GBA. Los datos de pago te los enviamos por WhatsApp una vez confirmado tu pedido.',
  },
  {
    question: '¿Se pueden pagar en cuotas?',
    answer:
      'Sí, podés abonar en cuotas con tarjeta de crédito a través de Mercado Pago. Las cuotas disponibles y los recargos dependen del banco y la tarjeta. Te informamos las opciones al coordinar el pago.',
  },
  {
    question: '¿Puedo hacer un cambio o devolución?',
    answer:
      'Aceptamos cambios por talle o color dentro de los 10 días corridos desde que recibís el pedido, siempre que la prenda esté sin uso, sin lavar y con todas sus etiquetas. Los gastos de envío de devolución corren por cuenta del cliente salvo defecto de fabricación.',
  },
  {
    question: '¿Qué pasa si recibo un producto con defecto?',
    answer:
      'Si el producto tiene algún defecto de fabricación, nos contactás por WhatsApp con foto y número de pedido, y te enviamos una prenda nueva sin costo adicional.',
  },
  {
    question: '¿Cómo me comunico si tengo un problema con mi pedido?',
    answer:
      'Podés escribirnos directamente por WhatsApp al +54 9 11 2406-1807 o por Instagram @roarkidsind. Respondemos en horario comercial de lunes a viernes de 9 a 18 hs.',
  },
  {
    question: '¿Tienen local físico?',
    answer:
      'Por el momento somos una tienda 100% online. Esto nos permite ofrecerte mejores precios y enviarte los productos directo a tu puerta.',
  },
  {
    question: '¿Cómo me entero de las novedades y promociones?',
    answer:
      'Seguinos en Instagram @roarkidsind para ver las últimas colecciones y promociones. También podés suscribirte al newsletter desde la tienda para recibir descuentos exclusivos.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (i: number) => setOpen(prev => (prev === i ? null : i))

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-roar-graphite mb-2">Preguntas frecuentes</h1>
      <p className="text-gray-500 mb-10">
        ¿Tenés dudas? Acá respondemos las consultas más comunes. Si no encontrás lo que buscás,
        escribinos por WhatsApp.
      </p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-roar-graphite text-sm pr-4">{faq.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed bg-white">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-roar-orange/10 border border-roar-orange/20 rounded-2xl p-6 text-center">
        <p className="text-roar-graphite font-semibold mb-1">¿No encontraste tu respuesta?</p>
        <p className="text-sm text-gray-500 mb-4">
          Escribinos y te respondemos a la brevedad.
        </p>
        <a
          href="https://wa.me/5491124061807?text=Hola%2C%20tengo%20una%20consulta%20sobre%20ROAR!%20Kids"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1ebe5b] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  )
}
