const FAQS = [
  { q: '¿Es seguro para mi hijo?', a: 'Sí. Vos elegís cada video y Robi revisa el contenido antes de crear la actividad. No hay chat ni contacto con extraños.' },
  { q: '¿Para qué edades es?', a: 'Pensado para chicos de 8 a 10 años, pero funciona con cualquier video que elijas según su nivel.' },
  { q: '¿De dónde salen los videos?', a: 'De YouTube. Pegás la URL del video que querés y Robi arma el quiz a partir de su contenido.' },
  { q: '¿Necesito tarjeta de crédito?', a: 'No. La versión gratuita no pide tarjeta: te registrás y empezás.' },
  { q: '¿Para qué sirven los puntos?', a: 'Se canjean por premios y experiencias en familia que vos definís, sin costo.' },
]

export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground md:text-4xl">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
