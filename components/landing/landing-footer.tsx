import { Robi } from '@/components/robi/Robi'

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <Robi size={28} />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold text-primary">Robi</span>
            <span className="text-[10px] font-semibold text-muted-foreground">Aprende. Juega. Gana.</span>
          </span>
        </div>
        <span className="text-sm text-muted-foreground">© 2026 Robi. Todos los derechos reservados.</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Privacidad</a>
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Términos</a>
        </div>
      </div>
    </footer>
  )
}
