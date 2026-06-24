import Image from 'next/image'
import { FadeIn } from './fade-in'

const STEPS = [
  { n: 1, title: 'Mirá', desc: 'Tu hijo mira un video que vos elegís — seguro y apto para su edad.', img: '/video-card.png' },
  { n: 2, title: 'Jugá', desc: 'Robi arma un quiz sobre el video. El chico responde y recibe ayuda al instante.', img: '/juga-img.png' },
  { n: 3, title: 'Ganá', desc: 'Suma puntos y badges, y los canjea por premios en familia.', img: '/gana-img.png' },
]

export function LandingHow() {
  return (
    <section id="como-funciona" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <FadeIn>
          <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">Mirá, jugá y aprendé</h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-base text-muted-foreground">
            Un ciclo simple que convierte cualquier video en aprendizaje real.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-full">
                  <Image src={s.img} alt={s.title} width={800} height={580} className="w-full h-72 rounded-2xl object-cover" />
                </div>
                <span className="flex size-[54px] items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">{s.n}</span>
                <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                <p className="max-w-xs text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
