'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Search } from 'lucide-react'

interface Article {
  icon: string
  iconBg: string
  title: string
  description: string
  content: string
}

interface Section {
  title: string
  articles: Article[]
}

const sections: Section[] = [
  {
    title: 'Ayuda rápida',
    articles: [
      {
        icon: '📹',
        iconBg: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)',
        title: 'Cómo asignar un video',
        description: 'Aprendé a asignar contenido a tu hijo.',
        content:
          'Andá a Biblioteca y pegá el link de YouTube. Robi procesa el video y genera el quiz automáticamente. Una vez listo, asignalo al perfil de tu hijo. Tu hijo verá el video en su panel y podrá completar el quiz para ganar puntos.',
      },
      {
        icon: '⭐',
        iconBg: 'color-mix(in oklch, #f59e0b 15%, transparent)',
        title: 'Cómo funcionan los puntos',
        description: 'Entendé cómo se ganan y para qué sirven.',
        content:
          'Los puntos se ganan completando quizzes. Cada respuesta correcta suma puntos. Con los puntos acumulados, tu hijo puede canjear premios que vos configurás en la sección Premios.',
      },
      {
        icon: '👑',
        iconBg: 'color-mix(in oklch, #f59e0b 12%, transparent)',
        title: 'Límites del plan',
        description: 'Conocé las limitaciones del plan Free y Premium.',
        content:
          'El plan gratuito incluye hasta 5 videos y 1 perfil de niño. Con Robi Premium podés agregar hasta 5 perfiles y videos ilimitados. Premium estará disponible próximamente.',
      },
    ],
  },
  {
    title: 'Entender el progreso',
    articles: [
      {
        icon: '🎯',
        iconBg: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)',
        title: 'Qué significan los aciertos',
        description: 'Entendé los resultados de los quizzes.',
        content:
          'Cada quiz tiene 5 preguntas. Los aciertos muestran cuántas respondió bien. 5/5 es perfecto, 3/5 es bueno. Si le va mal repetidamente, puede ser señal de que el video fue difícil para su edad.',
      },
      {
        icon: '📊',
        iconBg: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)',
        title: 'Cómo leer el progreso',
        description: 'Aprendé a interpretar las métricas.',
        content:
          'En el panel de detalle de cada hijo ves: videos vistos, quizzes completados y puntos acumulados. El historial muestra cada actividad con fecha. El círculo verde relleno indica que completó el quiz; el círculo vacío indica que solo vio el video.',
      },
    ],
  },
  {
    title: 'Tips para padres',
    articles: [
      {
        icon: '💡',
        iconBg: 'color-mix(in oklch, #f59e0b 12%, transparent)',
        title: 'Cómo ayudar a tu hijo',
        description: 'Consejos para potenciar el aprendizaje.',
        content:
          'Elegí videos cortos (menos de 5 minutos). Mirá el video junto a tu hijo la primera vez. Celebrá sus aciertos. Creá una rutina diaria de 10-15 minutos. Los videos de música y personajes conocidos suelen tener mejor recepción.',
      },
      {
        icon: '❤️',
        iconBg: 'color-mix(in oklch, #ef4444 12%, transparent)',
        title: 'Recomendaciones de uso',
        description: 'Rutinas y buenas prácticas diarias.',
        content:
          'Entre 1 y 3 videos por día. Repetir un video antes del quiz mejora los resultados. Asigná contenido variado: números, letras, ciencias, música. Revisá el historial una vez por semana para ajustar el contenido.',
      },
    ],
  },
  {
    title: 'Más opciones',
    articles: [
      {
        icon: '💎',
        iconBg: 'color-mix(in oklch, #8b5cf6 12%, transparent)',
        title: 'Ver beneficios Premium',
        description: 'Descubrí todo lo que incluye Premium.',
        content:
          'Robi Premium incluirá: perfiles ilimitados, videos ilimitados, estadísticas avanzadas y soporte prioritario. Próximamente disponible. Escribinos si querés recibir la notificación del lanzamiento.',
      },
    ],
  },
]

const support: Article = {
  icon: '💬',
  iconBg: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)',
  title: 'Contactar soporte',
  description: 'Escribinos y te ayudaremos.',
  content:
    'Podés escribirnos a hola@robieducacion.com y te respondemos en menos de 24 horas. Estamos para ayudarte con cualquier duda sobre el uso de Robi.',
}

function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden transition-all">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: article.iconBg }}
        >
          {article.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{article.title}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-snug">{article.description}</p>
        </div>
        {open
          ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pt-3 pb-4">
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">{article.content}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? sections.map((s) => ({
        ...s,
        articles: s.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.description.toLowerCase().includes(query.toLowerCase()) ||
            a.content.toLowerCase().includes(query.toLowerCase()),
        ),
      })).filter((s) => s.articles.length > 0)
    : sections

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Ayuda</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">¿En qué podemos ayudarte?</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar ayuda..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-11 rounded-2xl border border-border bg-card text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Sections */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border px-6 py-10 text-center">
          <p className="text-sm font-bold text-foreground">No encontramos resultados para "{query}"</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Probá con otras palabras o contactá soporte.</p>
        </div>
      ) : (
        filtered.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-foreground">{section.title}</h2>
            <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
              {section.articles.map((article) => (
                <ArticleCard key={article.title} article={article} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* ¿Necesitás más ayuda? */}
      {!query && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-foreground">¿Necesitás más ayuda?</h2>
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <ArticleCard article={support} />
          </div>
        </section>
      )}

      {/* Tip footer */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border border-pink-200 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800">
        <span className="text-base shrink-0">❤️</span>
        <p className="text-xs font-medium text-muted-foreground">
          <span className="font-bold" style={{ color: 'var(--robi-primary)' }}>Tip: </span>
          Celebrar los logros, aunque sean pequeños, motiva a seguir aprendiendo.
        </p>
      </div>
    </div>
  )
}
