import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { signOut } from '@/actions/auth'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('parent_unlocked')

  if (!unlocked) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.97 0.02 262)' }}>
      {/* Parent panel header — calmer, professional */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: 'oklch(1 0 0)',
          borderColor: 'oklch(0.90 0.03 262)',
          boxShadow: '0 1px 6px oklch(0.58 0.22 262 / 0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--robi-primary)' }}
          >
            ← Volver
          </Link>
          <span
            className="text-base font-extrabold tracking-tight hidden sm:block"
            style={{ color: 'var(--foreground)' }}
          >
            Panel de adultos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:flex items-center gap-1"
            style={{
              background: 'oklch(0.94 0.06 155 / 0.25)',
              color: 'oklch(0.40 0.12 155)',
              border: '1px solid oklch(0.68 0.18 155 / 0.30)',
            }}
          >
            🔓 Sesión activa (30 min)
          </span>

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{
                background: 'oklch(0.95 0.03 27)',
                color: 'oklch(0.50 0.18 27)',
                border: '1px solid oklch(0.85 0.10 27)',
              }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
