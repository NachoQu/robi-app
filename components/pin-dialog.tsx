'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { verifyPin } from '@/actions/pin'

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFirstTime: boolean
}

export function PinDialog({ open, onOpenChange, isFirstTime }: PinDialogProps) {
  const router = useRouter()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (open) {
      setDigits(['', '', '', ''])
      setError(null)
      setLoading(false)
      setTimeout(() => inputRefs[0].current?.focus(), 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = cleaned
    setDigits(newDigits)
    setError(null)
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
    // Auto-submit when last digit entered
    if (cleaned && index === 3) {
      const pin = [...newDigits.slice(0, 3), cleaned].join('')
      if (pin.length === 4) handleSubmit(pin)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  async function handleSubmit(pin?: string) {
    const finalPin = pin ?? digits.join('')
    if (finalPin.length < 4) {
      setError('Ingresá los 4 dígitos de tu PIN')
      return
    }
    setLoading(true)
    setError(null)
    const result = await verifyPin(finalPin)
    if (result.ok) {
      onOpenChange(false)
      router.push('/parent')
    } else {
      setError('PIN incorrecto. Intentá de nuevo.')
      setDigits(['', '', '', ''])
      setLoading(false)
      setTimeout(() => inputRefs[0].current?.focus(), 50)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-3xl border-0 shadow-2xl max-w-sm w-full"
        style={{ boxShadow: '0 8px 40px oklch(0.58 0.22 262 / 0.18)' }}
      >
        <DialogHeader className="pt-2 pb-0">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl select-none">🔒</span>
            <DialogTitle className="text-xl font-extrabold text-center" style={{ color: 'var(--robi-primary)' }}>
              Panel de adultos
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center font-medium px-2">
              {isFirstTime
                ? '¡Primera vez! Creá tu PIN de 4 dígitos para proteger el panel.'
                : 'Ingresá tu PIN para acceder al panel.'}
            </p>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* PIN input boxes */}
          <div className="flex gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className="w-14 h-14 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all duration-150 select-none"
                style={{
                  borderColor: digit ? 'var(--robi-primary)' : 'oklch(0.85 0.05 262)',
                  background: digit ? 'oklch(0.94 0.06 262)' : 'oklch(0.97 0.02 262)',
                  color: 'var(--robi-primary)',
                  caretColor: 'var(--robi-primary)',
                }}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="pin-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center w-full"
                style={{
                  background: 'oklch(0.97 0.05 27)',
                  color: 'oklch(0.50 0.20 27)',
                  border: '1.5px solid oklch(0.85 0.12 27)',
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.div whileTap={{ scale: 0.97 }} className="w-full">
            <Button
              onClick={() => handleSubmit()}
              disabled={loading || digits.join('').length < 4}
              className="w-full text-base font-bold rounded-2xl transition-all duration-200 hover:opacity-90"
              style={{
                background: loading ? 'oklch(0.75 0.10 262)' : 'var(--robi-primary)',
                color: 'white',
                height: '3rem',
                opacity: digits.join('').length < 4 && !loading ? 0.55 : 1,
              }}
            >
              {loading
                ? '⏳ Verificando…'
                : isFirstTime
                ? '🔐 Crear PIN'
                : '✅ Entrar'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
