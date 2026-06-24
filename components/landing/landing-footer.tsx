import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="-mt-2">
      {/* Mobile: texto encima, luego imagen */}
      <div className="flex flex-col items-center gap-4 px-6 py-8 text-center md:hidden">
        <span className="text-sm text-muted-foreground">© 2026 Robi. Todos los derechos reservados.</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Privacidad</a>
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Términos</a>
        </div>
      </div>
      <Image
        src="/montana-bg.png"
        alt="Montañas decorativas"
        width={1920}
        height={400}
        className="w-full object-cover md:hidden"
      />
      {/* Tablet/Desktop: texto en blanco sobre la imagen */}
      <div className="relative hidden md:block">
        <Image
          src="/montana-bg.png"
          alt="Montañas decorativas"
          width={1920}
          height={400}
          className="w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-6">
          <span className="text-sm text-white">© 2026 Robi. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4 text-sm text-white">
            <a href="#" className="font-semibold transition-colors hover:text-white/70">Privacidad</a>
            <a href="#" className="font-semibold transition-colors hover:text-white/70">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
