import { Heart, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

const BENEFITS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Heart, title: 'Para los niños', desc: 'Aprenden jugando, con Robi como su compañero. Desarrollan comprensión y confianza.' },
  { icon: ShieldCheck, title: 'Para los padres', desc: 'Acompañan el aprendizaje de sus hijos de forma fácil y segura, sin esfuerzo adicional.' },
  { icon: Users, title: 'Para todos', desc: 'Más tiempo de calidad juntos y momentos que realmente importan.' },
]

export function LandingBenefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground">Beneficios para toda la familia</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
