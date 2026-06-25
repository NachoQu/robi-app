'use client'

import { useState } from 'react'
import { KeyRound, Mail, Lock, Check, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ManagePinDialog } from '@/components/manage-pin-dialog'
import { sendPasswordResetEmail } from '@/actions/auth'

interface AccountClientProps {
  email: string
  hasPin: boolean
}

export function AccountClient({ email, hasPin: initialHasPin }: AccountClientProps) {
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [hasPin, setHasPin] = useState(initialHasPin)
  const [sendingReset, setSendingReset] = useState(false)

  async function handlePasswordReset() {
    setSendingReset(true)
    const result = await sendPasswordResetEmail()
    setSendingReset(false)
    if (result.ok) {
      toast.success('Te enviamos un email para cambiar tu contraseña.')
    } else {
      toast.error('No pudimos enviar el email. Intentá de nuevo.')
    }
  }

  const FREE = ['1 perfil de niño', 'Videos limitados', 'Quizzes con IA', 'Puntos y badges']
  const PREMIUM = ['Hasta 5 perfiles', 'Videos ilimitados', 'Catálogo de premios ampliado', 'Soporte prioritario']

  return (
    <div className="flex flex-col gap-8">

      {/* Plan */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Tu plan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Gratis */}
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-5">
            <div>
              <h3 className="text-base font-bold text-foreground">Gratis</h3>
              <p className="text-2xl font-extrabold text-primary">$0</p>
            </div>
            <ul className="flex flex-col gap-2">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Check size={14} className="text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <span className="mt-auto flex items-center justify-center h-10 w-full rounded-xl text-sm font-bold bg-primary/10 text-primary">
              Plan actual
            </span>
          </div>

          {/* Premium */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 opacity-80">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground">Premium</h3>
                <p className="text-2xl font-extrabold text-muted-foreground">Pronto</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold shrink-0" style={{ background: 'color-mix(in oklch, var(--robi-accent) 20%, transparent)', color: 'var(--robi-accent-ink)' }}>
                Próximamente
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Check size={14} className="text-muted-foreground shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button disabled className="mt-auto h-10 w-full rounded-xl text-sm font-bold border border-border text-muted-foreground cursor-not-allowed">
              Próximamente
            </button>
          </div>
        </div>
      </section>

      {/* Seguridad */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Seguridad</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <button
            onClick={() => setPinDialogOpen(true)}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-muted transition-colors text-left"
          >
            <span className="flex items-center justify-center rounded-xl w-9 h-9 shrink-0" style={{ background: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)' }}>
              <Lock size={17} style={{ color: 'var(--robi-primary)' }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">PIN del panel</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Protegé el acceso al panel adulto</p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${hasPin ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
              {hasPin ? 'Activo' : 'Sin PIN'}
            </span>
          </button>
        </div>
      </section>

      {/* Cuenta */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Mi cuenta</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <span className="flex items-center justify-center rounded-xl w-9 h-9 shrink-0 bg-blue-50 dark:bg-blue-900/20">
              <Mail size={17} className="text-blue-600 dark:text-blue-400" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Email</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={sendingReset}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-muted transition-colors text-left"
          >
            <span className="flex items-center justify-center rounded-xl w-9 h-9 shrink-0 bg-amber-50 dark:bg-amber-900/20">
              <KeyRound size={17} className="text-amber-600 dark:text-amber-400" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {sendingReset ? 'Enviando email…' : 'Te enviaremos un email'}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Soporte — solo mobile */}
      <section className="flex flex-col gap-3 lg:hidden">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Soporte</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <Link
            href="/parent/help"
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-muted transition-colors"
          >
            <span className="flex items-center justify-center rounded-xl w-9 h-9 shrink-0" style={{ background: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)' }}>
              <HelpCircle size={17} style={{ color: 'var(--robi-primary)' }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Ayuda</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Preguntas frecuentes y soporte</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        </div>
      </section>

      <ManagePinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        hasPin={hasPin}
        onPinChanged={(nowHasPin) => setHasPin(nowHasPin)}
      />
    </div>
  )
}
