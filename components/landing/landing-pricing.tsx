import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FREE = ['1 perfil de niño', 'Videos limitados', 'Quizzes con IA', 'Puntos y badges']
const PREMIUM = ['Hasta 5 perfiles', 'Videos ilimitados', 'Catálogo de premios ampliado', 'Soporte prioritario']

export function LandingPricing() {
  return (
    <section id="precios" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-4xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground md:text-4xl">Precios simples</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gratis</h3>
              <p className="text-3xl font-extrabold text-primary">$0</p>
            </div>
            <ul className="flex flex-col gap-2">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Check size={16} className="text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-auto">
              <Button variant="primary" className="h-11 w-full">Comenzar gratis</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 opacity-80 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Premium</h3>
                <p className="text-3xl font-extrabold text-muted-foreground">Pronto</p>
              </div>
              <span className="rounded-full bg-[var(--robi-accent)]/20 px-2.5 py-1 text-xs font-bold text-[var(--robi-accent-ink)]">
                Próximamente
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Check size={16} className="text-muted-foreground" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="tertiary" disabled className="mt-auto h-11 w-full">Próximamente</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
