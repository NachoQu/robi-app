'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { submitQuiz } from '@/actions/quiz'

interface QuizQuestion {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  position: number
}

type AnswerState = 'idle' | 'correct' | 'incorrect'

const ROBI_MESSAGES = {
  idle: '¡Leé bien la pregunta y elegí tu respuesta! 🤔',
  correct: ['¡Excelente! ¡Eso es correcto! 🌟', '¡Muy bien! ¡Sos un genio! 🎉', '¡Perfecto! ¡Lo sabías! 🚀', '¡Increíble! ¡Sí señor! ⭐', '¡Bravo! ¡Eso estuvo buenísimo! 🏆'],
  incorrect: ['¡No importa, la próxima! 💪', '¡Ánimo, seguimos aprendiendo! 🌱', '¡Casi! La respuesta correcta es la verde 👆', '¡No te rindas, vamos! 🤗'],
}

function getRobiMsg(state: AnswerState, seed?: number): string {
  if (state === 'idle') return ROBI_MESSAGES.idle
  const list = ROBI_MESSAGES[state]
  return list[(seed ?? 0) % list.length]
}

export default function QuizPage() {
  const params = useParams()
  const profileId = params.profileId as string
  const videoId = params.videoId as string
  const router = useRouter()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const ttsSupported = useRef(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      ttsSupported.current = true
    }
  }, [])

  useEffect(() => {
    async function loadQuestions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('quiz_questions')
        .select('id, question_text, options, correct_index, position')
        .eq('video_id', videoId)
        .order('position')
      if (data) {
        setQuestions(
          data.map((q) => ({
            ...q,
            options: q.options as string[],
          }))
        )
      }
      setLoading(false)
    }
    loadQuestions()
  }, [videoId])

  const speakQuestion = useCallback(
    (question: QuizQuestion) => {
      if (!ttsSupported.current || !ttsEnabled) return
      window.speechSynthesis.cancel()
      const text = `Pregunta ${question.position + 1}. ${question.question_text}. Opción 1: ${question.options[0]}. Opción 2: ${question.options[1]}. Opción 3: ${question.options[2]}. Opción 4: ${question.options[3]}.`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-AR'
      // Prefer a Spanish voice
      const voices = window.speechSynthesis.getVoices()
      const esVoice = voices.find((v) => v.lang.startsWith('es'))
      if (esVoice) utterance.voice = esVoice
      utterance.rate = 0.92
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [ttsEnabled]
  )

  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    if (currentQuestion && ttsEnabled) {
      speakQuestion(currentQuestion)
    }
    return () => {
      if (ttsSupported.current) window.speechSynthesis.cancel()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, ttsEnabled, currentQuestion?.id])

  const handleToggleTts = () => {
    if (!ttsSupported.current) return
    setTtsEnabled((prev) => {
      if (prev) {
        window.speechSynthesis.cancel()
      } else if (currentQuestion) {
        // Will trigger via useEffect on the next render
      }
      return !prev
    })
  }

  const handleSelectOption = (optionIndex: number) => {
    if (answerState !== 'idle') return
    setSelectedOption(optionIndex)
    const isCorrect = optionIndex === currentQuestion.correct_index
    setAnswerState(isCorrect ? 'correct' : 'incorrect')
    if (ttsSupported.current) window.speechSynthesis.cancel()
  }

  const handleNext = async () => {
    if (selectedOption === null) return
    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setAnswerState('idle')
    } else {
      // Last question: submit
      setSubmitting(true)
      setSubmitError(false)
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        )
        const result = await Promise.race([
          submitQuiz({ childProfileId: profileId, videoId, answers: newAnswers }),
          timeout,
        ])
        // Pass result via sessionStorage (clean, no URL length issues)
        sessionStorage.setItem(
          `quiz-result-${profileId}`,
          JSON.stringify(result)
        )
        router.push(`/kid/${profileId}/result`)
      } catch (err) {
        console.error('submitQuiz failed', err)
        setSubmitting(false)
        setSubmitError(true)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <RobiPlaceholder size={80} mood="thinking" />
        </motion.div>
        <p className="text-xl font-extrabold" style={{ color: 'var(--robi-primary)' }}>
          Cargando preguntas…
        </p>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-bold text-muted-foreground">No hay preguntas disponibles.</p>
      </div>
    )
  }

  const total = questions.length
  const progress = ((currentIndex + 1) / total) * 100

  // Derive Robi mood from answer state
  const robiMood = answerState === 'correct' ? 'celebrate' : answerState === 'incorrect' ? 'encourage' : 'talking'

  // Derive Robi bubble background from answer state
  const robiBubbleBg = answerState === 'correct'
    ? 'bg-secondary/20'
    : answerState === 'incorrect'
    ? 'bg-[var(--robi-coral)]/15'
    : 'bg-primary/10'

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-6">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5">

        {/* Back to video */}
        <button
          onClick={() => router.push(`/kid/${profileId}/watch/${videoId}`)}
          className="text-sm font-bold flex items-center gap-1 mb-3"
          style={{ color: 'var(--robi-primary)' }}
          aria-label="Volver al video"
        >
          ← Volver al video
        </button>

        {/* Header row: progress + TTS toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-extrabold"
                style={{ color: 'var(--robi-primary)' }}
              >
                Pregunta {currentIndex + 1} de {total}
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {currentIndex + 1}/{total} respondidas
              </span>
            </div>
            {/* Progress bar using design-system primitive */}
            <div className="w-full h-3 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              />
            </div>
          </div>

          {/* TTS toggle */}
          {ttsSupported.current && (
            <button
              onClick={handleToggleTts}
              className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-extrabold transition-all active:scale-95 shrink-0"
              style={{
                background: ttsEnabled ? 'var(--robi-primary)' : 'var(--muted)',
                color: ttsEnabled ? 'white' : 'var(--muted-foreground)',
                boxShadow: ttsEnabled ? '0 2px 10px color-mix(in oklch, var(--robi-primary) 30%, transparent)' : 'none',
              }}
              aria-label={ttsEnabled ? 'Apagar lectura en voz alta' : 'Activar lectura en voz alta'}
            >
              <span className="text-lg">{ttsEnabled ? '🔊' : '🔇'}</span>
              Leer
            </button>
          )}
        </div>

        {/* Robi guide bubble */}
        <motion.div
          key={`robi-${currentIndex}-${answerState}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-3xl px-4 py-3 ${robiBubbleBg}`}
        >
          <motion.div
            animate={
              answerState === 'correct'
                ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                : answerState === 'incorrect'
                ? { scale: [1, 0.9, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.5 }}
          >
            <RobiPlaceholder size={44} mood={robiMood} />
          </motion.div>
          <p className="text-sm font-bold text-foreground">
            {getRobiMsg(answerState, currentIndex)}
          </p>
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="bg-card shadow-sm border border-border rounded-3xl px-5 py-5"
          >
            <p className="text-lg font-semibold leading-snug text-foreground">
              {currentQuestion.question_text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options — 2×2 grid on lg+, single column on mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`opts-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQuestion.correct_index
              const revealed = answerState !== 'idle'

              // Build className-based styles where possible; fall back to inline for dynamic values
              let optionClassName = 'w-full text-left rounded-2xl px-4 py-4 font-bold text-base transition-colors border-2'

              if (revealed) {
                if (isCorrect) {
                  optionClassName += ' bg-secondary text-secondary-foreground border-secondary'
                } else if (isSelected && !isCorrect) {
                  optionClassName += ' bg-[var(--robi-coral)] text-white border-[var(--robi-coral)]'
                } else {
                  optionClassName += ' bg-muted/50 text-muted-foreground border-border'
                }
              } else {
                optionClassName += ' bg-card border-border hover:border-primary/50'
              }

              // Badge (A/B/C/D circle) colors
              let badgeBg: string
              let badgeColor: string
              if (revealed) {
                if (isCorrect || isSelected) {
                  badgeBg = 'rgba(255,255,255,0.25)'
                  badgeColor = isCorrect ? 'var(--secondary-foreground)' : 'white'
                } else {
                  badgeBg = 'var(--muted)'
                  badgeColor = 'var(--muted-foreground)'
                }
              } else {
                badgeBg = 'var(--robi-primary)'
                badgeColor = 'white'
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={revealed}
                  whileTap={!revealed ? { scale: 0.97 } : {}}
                  whileHover={!revealed ? { scale: 1.02 } : {}}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                  className={optionClassName}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-sm shrink-0"
                      style={{ background: badgeBg, color: badgeColor }}
                    >
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    {option}
                    {revealed && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check className="w-5 h-5" />
                      </motion.span>
                    )}
                    {revealed && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        ❌
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Next button — appears after answering */}
        <AnimatePresence>
          {answerState !== 'idle' && (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Button
                variant="primary"
                className="w-full h-12 text-lg font-extrabold tracking-wide rounded-3xl"
                onClick={handleNext}
                disabled={submitting}
              >
                {submitting
                  ? '¡Guardando resultado…'
                  : currentIndex < questions.length - 1
                  ? 'Siguiente pregunta →'
                  : submitError
                  ? 'Reintentar 🔄'
                  : '¡Ver mi resultado! 🎉'}
              </Button>
              {submitError && (
                <p
                  className="mt-3 text-center text-base font-bold"
                  style={{ color: 'var(--robi-coral)' }}
                >
                  Ups, no pudimos guardar tu resultado. ¡Tocá de nuevo!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
