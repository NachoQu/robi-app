'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'
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
        const result = await submitQuiz({
          childProfileId: profileId,
          videoId,
          answers: newAnswers,
        })
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
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{
          background: 'linear-gradient(160deg, oklch(0.92 0.07 262) 0%, oklch(0.96 0.06 95) 60%, oklch(0.94 0.08 155 / 0.4) 100%)',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <RobiPlaceholder size={80} />
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
  const progress = ((currentIndex) / total) * 100

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-6"
      style={{
        background: 'linear-gradient(160deg, oklch(0.92 0.07 262) 0%, oklch(0.96 0.06 95) 60%, oklch(0.94 0.08 155 / 0.4) 100%)',
      }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5">

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
                {currentIndex}/{total} respondidas
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'oklch(0.88 0.06 262 / 0.5)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--robi-primary)' }}
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
                background: ttsEnabled ? 'var(--robi-primary)' : 'oklch(0.88 0.06 262 / 0.5)',
                color: ttsEnabled ? 'white' : 'oklch(0.35 0.1 262)',
                boxShadow: ttsEnabled ? '0 2px 10px oklch(0.58 0.22 262 / 0.3)' : 'none',
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
          className="flex items-center gap-3 rounded-3xl px-4 py-3"
          style={{
            background: answerState === 'correct'
              ? 'oklch(0.92 0.12 155 / 0.7)'
              : answerState === 'incorrect'
              ? 'oklch(0.94 0.10 30 / 0.7)'
              : 'oklch(0.94 0.06 262 / 0.6)',
          }}
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
            <RobiPlaceholder size={44} mood="talking" />
          </motion.div>
          <p className="text-sm font-bold" style={{ color: 'oklch(0.20 0.06 262)' }}>
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
            className="rounded-3xl px-5 py-5 shadow-lg"
            style={{
              background: 'oklch(1 0 0 / 0.88)',
              boxShadow: '0 6px 28px oklch(0.58 0.22 262 / 0.15)',
            }}
          >
            <p
              className="text-lg font-extrabold leading-snug"
              style={{ color: 'oklch(0.18 0.05 262)' }}
            >
              {currentQuestion.question_text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`opts-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.08 }}
            className="flex flex-col gap-3"
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQuestion.correct_index
              const revealed = answerState !== 'idle'

              let bg = 'oklch(1 0 0 / 0.75)'
              let border = '2px solid oklch(0.82 0.08 262 / 0.4)'
              let color = 'oklch(0.20 0.06 262)'
              let shadow = '0 2px 10px oklch(0.58 0.22 262 / 0.08)'

              if (revealed) {
                if (isCorrect) {
                  bg = 'var(--robi-success)'
                  border = '2px solid oklch(0.55 0.18 155)'
                  color = 'white'
                  shadow = '0 4px 16px oklch(0.55 0.18 155 / 0.4)'
                } else if (isSelected && !isCorrect) {
                  bg = 'var(--robi-coral)'
                  border = '2px solid oklch(0.55 0.18 30)'
                  color = 'white'
                  shadow = '0 4px 16px oklch(0.55 0.18 30 / 0.4)'
                } else {
                  bg = 'oklch(0.94 0.02 262 / 0.5)'
                  color = 'oklch(0.55 0.05 262)'
                  border = '2px solid oklch(0.82 0.04 262 / 0.3)'
                }
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
                  className="w-full text-left rounded-2xl px-4 py-4 font-bold text-base transition-colors"
                  style={{ background: bg, border, color, boxShadow: shadow }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-sm shrink-0"
                      style={{
                        background: revealed
                          ? (isCorrect ? 'oklch(1 0 0 / 0.25)' : isSelected ? 'oklch(1 0 0 / 0.25)' : 'oklch(0.80 0.04 262 / 0.4)')
                          : 'var(--robi-primary)',
                        color: revealed ? (isCorrect || isSelected ? 'white' : 'oklch(0.55 0.05 262)') : 'white',
                      }}
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
                        ✅
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
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleNext}
                disabled={submitting}
                className="w-full rounded-3xl py-4 text-lg font-extrabold tracking-wide shadow-xl transition-colors"
                style={{
                  background: submitting ? 'oklch(0.75 0.10 155)' : 'var(--robi-success)',
                  color: 'white',
                  boxShadow: '0 6px 24px oklch(0.55 0.18 155 / 0.45)',
                }}
              >
                {submitting
                  ? '¡Guardando resultado…'
                  : currentIndex < questions.length - 1
                  ? 'Siguiente pregunta →'
                  : submitError
                  ? 'Reintentar 🔄'
                  : '¡Ver mi resultado! 🎉'}
              </motion.button>
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
