export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row">
        <span>© 2026 Robi. Todos los derechos reservados.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Privacidad</a>
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Términos</a>
        </div>
      </div>
    </footer>
  )
}
