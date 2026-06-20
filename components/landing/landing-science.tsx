import { Activity, Brain, Zap, Trophy, type LucideIcon } from 'lucide-react'

const PRINCIPLES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Activity, title: 'Aprendizaje activo', desc: 'Participar —no solo mirar— involucra más al cerebro y mejora la comprensión.' },
  { icon: Brain, title: 'Práctica de recuperación', desc: 'Tener que recordar para responder fija lo aprendido mejor que volver a verlo.' },
  { icon: Zap, title: 'Feedback inmediato', desc: 'Robi marca al instante qué se entendió y qué reforzar, mientras el tema está fresco.' },
  { icon: Trophy, title: 'Refuerzo positivo', desc: 'Completar siempre da premio; equivocarse no penaliza, así el chico se anima a intentar.' },
]

export function LandingScience() {
  return (
    <section id="por-que-funciona" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">¿Por qué funciona?</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base text-muted-foreground">
          Mirar un video está bien. Pero el aprendizaje real pasa cuando el chico{' '}
          <strong className="text-foreground">hace</strong> algo con lo que vio.
        </p>

        {/* Comparación pasivo vs activo */}
        <div className="mx-auto mb-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-1 text-sm font-bold text-muted-foreground">Solo mirar 😴</p>
            <p className="text-sm text-muted-foreground">El video pasa y se olvida. Sin participación, poco queda.</p>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-card p-5">
            <p className="mb-1 text-sm font-bold text-primary">Mirar + hacer 🚀</p>
            <p className="text-sm text-foreground">El chico responde, recuerda y aplica. El conocimiento se fija.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
