import { RobiPlaceholder } from '@/components/robi-placeholder'

export default function ParentPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <RobiPlaceholder size={64} />
      <h1
        className="text-2xl font-extrabold"
        style={{ color: 'var(--foreground)' }}
      >
        Panel de adultos
      </h1>
      <p className="text-base text-muted-foreground font-medium max-w-sm">
        Acá podrás gestionar perfiles, ver el historial de aprendizaje y configurar premios. ¡Próximamente!
      </p>
    </div>
  )
}
