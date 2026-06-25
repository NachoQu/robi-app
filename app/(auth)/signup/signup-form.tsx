'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { signUp } from '@/actions/auth'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signUp(email, password)
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
        {/* Step indicator */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="text-xs font-semibold text-muted-foreground">Paso 1 de 3</p>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
            <div className="h-1.5 w-8 rounded-full bg-muted" />
            <div className="h-1.5 w-8 rounded-full bg-muted" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <Link href="/" aria-label="Volver al inicio" className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
            >
              <RobiPlaceholder size={80} />
            </motion.div>
            <Image src="/robi-logo-text.png" alt="Robi" width={100} height={40} className="object-contain" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            ¡Hola! Empezá la aventura
          </h1>
          <p className="text-base text-muted-foreground text-center font-medium">
            Tu hijo aprende, juega y gana premios reales
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-primary pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
              <Link href="/login" className="font-bold hover:underline text-primary">
                Iniciá sesión
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
          🎁 Tu hijo recibe premios reales por aprender
        </p>
      </motion.div>
    </div>
  )
}
