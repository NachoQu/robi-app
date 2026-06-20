import { PreviewVideo, PreviewQuiz, PreviewResult } from './previews'

const STEPS = [
  { n: 1, title: 'Mirá', desc: 'Tu hijo mira un video que vos elegís — seguro y apto para su edad.', preview: 'video' as const },
  { n: 2, title: 'Jugá', desc: 'Robi arma un quiz sobre el video. El chico responde y recibe ayuda al instante.', preview: 'quiz' as const },
  { n: 3, title: 'Ganá', desc: 'Suma puntos y badges, y los canjea por premios en familia.', preview: 'result' as const },
]

function Preview({ kind }: { kind: 'video' | 'quiz' | 'result' }) {
  if (kind === 'video') return <PreviewVideo />
  if (kind === 'quiz') return <PreviewQuiz />
  return <PreviewResult />
}

export function LandingHow() {
  return (
    <section id="como-funciona" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">Mirá, jugá y aprendé</h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-base text-muted-foreground">
          Un ciclo simple que convierte cualquier video en aprendizaje real.
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-4 text-center">
              <div className="w-full max-w-xs"><Preview kind={s.preview} /></div>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.n}</span>
              <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
