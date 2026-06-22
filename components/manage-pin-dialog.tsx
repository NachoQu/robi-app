'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { verifyPassword, updatePin, removePin } from '@/actions/pin'

type Step = 'password' | 'menu' | 'new-pin' | 'confirm-remove'

interface ManagePinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasPin: boolean
  onPinChanged: (nowHasPin: boolean) => void
}

export function ManagePinDialog({ open, onOpenChange, hasPin, onPinChanged }: ManagePinDialogProps) {
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)
  const inputsRef = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (open) {
      setPassword('')
      setDigits(['', '', '', ''])
      setError(null)
      setLoading(false)
      if (!hasPin) {
        setStep('new-pin')
        setTimeout(() => inputsRef.current[0]?.focus(), 100)
      } else {
        setStep('password')
        setTimeout(() => passwordRef.current?.focus(), 100)
      }
    }
  }, [open, hasPin])

  async function handleVerifyPassword() {
    if (!password) return
    setLoading(true)
    setError(null)
    const result = await verifyPassword(password)
    setLoading(false)
    if (result.ok) {
      setStep('menu')
    } else {
      setError('Contraseña incorrecta. Intentá de nuevo.')
    }
  }

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = cleaned
    setDigits(newDigits)
    setError(null)
    if (cleaned && index < 3) inputsRef.current[index + 1]?.focus()
    if (cleaned && index === 3) {
      const pin = [...newDigits.slice(0, 3), cleaned].join('')
      if (pin.length === 4) handleSavePin(pin)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function handleSavePin(pin?: string) {
    const finalPin = pin ?? digits.join('')
    if (finalPin.length < 4) { setError('Ingresá los 4 dígitos'); return }
    setLoading(true)
    setError(null)
    const result = await updatePin(finalPin)
    setLoading(false)
    if (result.ok) { onPinChanged(true); onOpenChange(false) }
    else setError('No pudimos guardar el PIN. Intentá de nuevo.')
  }

  async function handleRemovePin() {
    setLoading(true)
    const result = await removePin()
    setLoading(false)
    if (result.ok) { onPinChanged(false); onOpenChange(false) }
    else setError('No pudimos eliminar el PIN. Intentá de nuevo.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-3xl border-0 shadow-2xl max-w-sm w-full"
        style={{ boxShadow: '0 8px 40px color-mix(in oklch, var(--robi-primary) 18%, transparent)' }}
      >
        <AnimatePresence mode="wait">

          {/* Step 1: Verificar contraseña */}
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="pt-2 pb-0">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl select-none">🔑</span>
                  <DialogTitle className="text-xl font-extrabold text-center" style={{ color: 'var(--robi-primary)' }}>
                    Gestionar PIN
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-center font-medium px-2">
                    Ingresá tu contraseña de cuenta para continuar.
                  </p>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-5 px-1">
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                  disabled={loading}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center bg-destructive/10 text-destructive border border-destructive/30"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  onClick={handleVerifyPassword}
                  disabled={loading || !password}
                  className="w-full text-base font-bold rounded-2xl h-12"
                  style={{ background: 'var(--robi-primary)', color: 'white', opacity: !password ? 0.55 : 1 }}
                >
                  {loading ? '⏳ Verificando…' : 'Continuar'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Menú opciones */}
          {step === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="pt-2 pb-0">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl select-none">🛡️</span>
                  <DialogTitle className="text-xl font-extrabold text-center" style={{ color: 'var(--robi-primary)' }}>
                    Gestionar PIN
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-5 px-1">
                <button
                  onClick={() => { setDigits(['', '', '', '']); setError(null); setStep('new-pin'); setTimeout(() => inputsRef.current[0]?.focus(), 100) }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 hover:bg-muted transition-colors text-left"
                >
                  <span className="text-xl">🔐</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{hasPin ? 'Cambiar PIN' : 'Crear PIN'}</p>
                    <p className="text-xs text-muted-foreground font-medium">{hasPin ? 'Establecé un nuevo PIN de 4 dígitos' : 'Protegé el panel con un PIN'}</p>
                  </div>
                </button>
                {hasPin && (
                  <button
                    onClick={() => setStep('confirm-remove')}
                    className="w-full flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 hover:bg-destructive/10 transition-colors text-left"
                  >
                    <span className="text-xl">🗑️</span>
                    <div>
                      <p className="text-sm font-bold text-destructive">Eliminar PIN</p>
                      <p className="text-xs text-muted-foreground font-medium">El panel quedará sin protección</p>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Nuevo PIN */}
          {step === 'new-pin' && (
            <motion.div
              key="new-pin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="pt-2 pb-0">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl select-none">🔐</span>
                  <DialogTitle className="text-xl font-extrabold text-center" style={{ color: 'var(--robi-primary)' }}>
                    {hasPin ? 'Nuevo PIN' : 'Crear PIN'}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-center font-medium px-2">
                    Ingresá un PIN de 4 dígitos.
                  </p>
                </div>
              </DialogHeader>
              <div className="flex flex-col items-center gap-5 py-5">
                <div className="flex gap-3">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { if (el) inputsRef.current[i] = el }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={loading}
                      className="w-14 h-14 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all duration-150 select-none"
                      style={{
                        borderColor: digit ? 'var(--robi-primary)' : 'var(--border)',
                        background: digit ? 'color-mix(in oklch, var(--robi-primary) 10%, transparent)' : 'var(--muted)',
                        color: 'var(--robi-primary)',
                      }}
                      aria-label={`Dígito ${i + 1}`}
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center w-full bg-destructive/10 text-destructive border border-destructive/30">
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={() => setStep('menu')} className="flex-1 rounded-2xl h-12 font-bold">
                    Volver
                  </Button>
                  <Button
                    onClick={() => handleSavePin()}
                    disabled={loading || digits.join('').length < 4}
                    className="flex-1 text-base font-bold rounded-2xl h-12"
                    style={{ background: 'var(--robi-primary)', color: 'white', opacity: digits.join('').length < 4 ? 0.55 : 1 }}
                  >
                    {loading ? '⏳ Guardando…' : 'Guardar PIN'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmar eliminar */}
          {step === 'confirm-remove' && (
            <motion.div
              key="confirm-remove"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="pt-2 pb-0">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl select-none">⚠️</span>
                  <DialogTitle className="text-xl font-extrabold text-center text-destructive">
                    ¿Eliminar PIN?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-center font-medium px-2">
                    El panel de adultos quedará sin protección y cualquiera podrá acceder.
                  </p>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-5 px-1">
                <AnimatePresence>
                  {error && (
                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center bg-destructive/10 text-destructive border border-destructive/30">
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  onClick={handleRemovePin}
                  disabled={loading}
                  className="w-full font-bold rounded-2xl h-12"
                  style={{ background: 'var(--destructive)', color: 'white' }}
                >
                  {loading ? '⏳ Eliminando…' : 'Sí, eliminar PIN'}
                </Button>
                <Button variant="outline" onClick={() => setStep('menu')} className="w-full rounded-2xl h-12 font-bold">
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
