'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signUp } from '@/actions/auth'

function RobiPlaceholder() {
  return (
    <span
      className="flex items-center justify-center w-20 h-20 rounded-full text-4xl select-none"
      style={{ background: 'var(--robi-primary)', boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.35)' }}
      aria-label="Robi el robot"
    >
      🤖
    </span>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signUp(email, password)
    // If signUp redirects, we never get here; only set error if returned
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(145deg, oklch(0.94 0.06 262) 0%, oklch(0.96 0.05 95) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
          >
            <RobiPlaceholder />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--robi-primary)' }}>
            ¡Hola! Soy Robi 👋
          </h1>
          <p className="text-base text-muted-foreground text-center font-medium">
            Creá tu cuenta y empezá a ganar puntos aprendiendo
          </p>
        </div>

        <Card className="rounded-3xl border-0 shadow-2xl" style={{ boxShadow: '0 8px 40px oklch(0.58 0.22 262 / 0.15)' }}>
          <CardHeader className="pb-2 pt-6 px-8">
            <h2 className="text-xl font-bold text-center" style={{ color: 'var(--foreground)' }}>
              Crear cuenta
            </h2>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-[oklch(0.58_0.22_262)]"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-[oklch(0.58_0.22_262)]"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: 'oklch(0.97 0.05 27)', color: 'oklch(0.50 0.20 27)', border: '1.5px solid oklch(0.85 0.12 27)' }}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <motion.div whileTap={{ scale: 0.97 }} className="mt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 text-base font-bold rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{
                    background: loading ? 'oklch(0.75 0.10 262)' : 'var(--robi-primary)',
                    color: 'white',
                    fontSize: '1.05rem',
                    height: '3.25rem',
                  }}
                >
                  {loading ? '⏳ Creando cuenta…' : '🚀 ¡Crear mi cuenta!'}
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5 font-medium">
              ¿Ya tenés cuenta?{' '}
              <Link
                href="/login"
                className="font-bold hover:underline"
                style={{ color: 'var(--robi-primary)' }}
              >
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
          🎮 ¡Ganás 6 premios de regalo al registrarte!
        </p>
      </motion.div>
    </div>
  )
}
