'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { signUp } from '@/actions/auth'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background">
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
            <RobiPlaceholder size={80} />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            ¡Hola! Soy Robi 👋
          </h1>
          <p className="text-base text-muted-foreground text-center font-medium">
            Creá tu cuenta y empezá a ganar puntos aprendiendo
          </p>
        </div>

        <Card className="rounded-3xl bg-card shadow-sm border border-border">
          <CardHeader className="pb-2 pt-6 px-8">
            <h2 className="text-xl font-bold text-center text-foreground">
              Crear cuenta
            </h2>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-primary"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
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
                  className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-primary"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/30"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <motion.div whileTap={{ scale: 0.97 }} className="mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold"
                >
                  {loading ? '⏳ Creando cuenta…' : '🚀 ¡Crear mi cuenta!'}
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5 font-medium">
              ¿Ya tenés cuenta?{' '}
              <Link
                href="/login"
                className="font-bold hover:underline text-primary"
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
