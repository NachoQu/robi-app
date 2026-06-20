import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingCta() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary px-6 py-12 text-center">
          <h2 className="text-3xl font-extrabold text-primary-foreground md:text-4xl">Empezá gratis hoy</h2>
          <p className="max-w-md text-base text-primary-foreground/90">
            Convertí el tiempo de pantalla en tiempo de aprendizaje. Sin tarjeta, en minutos.
          </p>
          <Link href="/signup">
            <Button variant="secondary" className="h-12 px-8 text-base">Crear mi cuenta</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
