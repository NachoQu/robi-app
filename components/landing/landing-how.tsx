import { Link2, Bot, Gamepad2, Star, Gift, type LucideIcon } from 'lucide-react'

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Link2, title: 'Elegí un video', desc: 'Los padres agregan la URL de YouTube que quieren que su hijo aprenda.' },
  { icon: Bot, title: 'Robi crea la actividad', desc: 'Nuestra IA genera un quiz divertido y seguro basado en el contenido del video.' },
  { icon: Gamepad2, title: 'Jugá y aprendé', desc: 'Los chicos ven el video, juegan el quiz y reciben retroalimentación al instante.' },
  { icon: Star, title: 'Ganá puntos y badges', desc: 'Respondiendo bien, ganan puntos y badges coleccionables.' },
  { icon: Gift, title: 'Canjeá premios', desc: 'Los puntos se canjean por experiencias en familia sin costo.' },
]

export function LandingHow() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground">¿Cómo funciona?</h2>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon size={28} className="text-primary" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
