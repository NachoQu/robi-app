import Image from 'next/image'
import { FadeIn } from './fade-in'

const ROWS = [
  {
    title: 'Aprendizaje activo',
    desc: 'Participar —no solo mirar— involucra más al cerebro y mejora la comprensión. Cuando el chico responde preguntas sobre el video, procesa la información de forma más profunda.',
    img: '/aprendizaje-activo.png',
    reverse: false,
  },
  {
    title: 'Refuerzo positivo',
    desc: 'Completar siempre da premio; equivocarse no penaliza, así el chico se anima a intentar. Un entorno seguro donde el error es parte del aprendizaje.',
    img: '/recompensa.png',
    reverse: true,
  },
]

export function LandingScience() {
  return (
    <section id="por-que-funciona" className="scroll-mt-20 bg-card/40 py-[120px]">
      <div className="mx-auto w-full max-w-5xl px-4">
        <FadeIn>
          <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">¿Por qué funciona?</h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-base text-muted-foreground">
            Mirar un video está bien. Pero el aprendizaje real pasa cuando el chico{' '}
            <strong className="text-foreground">hace</strong> algo con lo que vio.
          </p>
        </FadeIn>

        <div className="flex flex-col gap-16">
          {ROWS.map(({ title, desc, img, reverse }) => (
            <div
              key={title}
              className={`flex flex-col items-center gap-8 md:flex-row md:gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}
            >
              <FadeIn direction={reverse ? 'right' : 'left'} className="w-full md:w-1/2">
                <Image
                  src={img}
                  alt={title}
                  width={600}
                  height={420}
                  className="w-full rounded-2xl object-cover"
                />
              </FadeIn>
              <FadeIn direction={reverse ? 'left' : 'right'} delay={0.1} className="w-full md:w-1/2">
                <h3 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{desc}</p>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
