import Image from 'next/image'
import { FadeIn } from './fade-in'

const BENEFITS: { icon: string; title: string; desc: string }[] = [
  { icon: '/heart-icon.png', title: 'Para los niños', desc: 'Aprenden jugando, con Robi como su compañero. Desarrollan comprensión y confianza.' },
  { icon: '/parental-icon.png', title: 'Para los padres', desc: 'Acompañan el aprendizaje de sus hijos de forma fácil y segura, sin esfuerzo adicional.' },
  { icon: '/group-icon.png', title: 'Para todos', desc: 'Más tiempo de calidad juntos y momentos que realmente importan.' },
]

export function LandingBenefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 py-[120px]">
      <div className="mx-auto w-full max-w-6xl px-4">
        <FadeIn>
          <h2 className="mb-16 text-center text-3xl font-extrabold text-foreground md:text-4xl">Beneficios para toda la familia</h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {BENEFITS.map(({ icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm h-full">
                <Image src={icon} alt={title} width={144} height={144} className="m-0 p-0" />
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
