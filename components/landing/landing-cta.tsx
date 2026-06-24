'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FadeIn } from './fade-in'

const confetti = [
  // top-left
  { top: '-14%', left: '-8%',  w: 18, h: 8,  rotate: -30, color: '#FFC447', dy: 8,  duration: 3.2 },
  { top: '5%',   left: '-14%', w: 10, h: 14, rotate: 15,  color: '#FF7A59', dy: -10, duration: 2.8 },
  { top: '-8%',  left: '10%',  w: 14, h: 6,  rotate: 50,  color: '#4CA3F7', dy: 6,  duration: 3.6 },
  // top-right
  { top: '-16%', right: '8%',  w: 16, h: 7,  rotate: 25,  color: '#FF7A59', dy: -8, duration: 3.1 },
  { top: '-6%',  right: '-10%',w: 10, h: 14, rotate: 0,   color: '#FFC447', dy: 10, duration: 2.6 },
  { top: '4%',   right: '-16%',w: 14, h: 6,  rotate: -40, color: '#7ED957', dy: -6, duration: 3.4 },
  // bottom-left
  { bottom: '16%', left: '-14%', w: 12, h: 6,  rotate: 20,  color: '#2DBE9E', dy: 7,  duration: 3.0 },
  { bottom: '4%',  left: '-6%',  w: 8,  h: 12, rotate: -15, color: '#FF7A59', dy: -9, duration: 2.9 },
  // bottom-right
  { bottom: '18%', right: '-14%',w: 14, h: 6,  rotate: -25, color: '#FFC447', dy: 8,  duration: 3.3 },
  { bottom: '6%',  right: '-8%', w: 10, h: 14, rotate: 10,  color: '#4CA3F7', dy: -7, duration: 2.7 },
  { bottom: '30%', right: '-18%',w: 8,  h: 12, rotate: 45,  color: '#7ED957', dy: 6,  duration: 3.5 },
]

export function LandingCta() {
  const reduced = useReducedMotion()

  return (
    <section className="pb-0 pt-24">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
          <FadeIn direction="left" className="flex flex-col items-start gap-5 text-left">
            <h2 className="text-3xl font-extrabold text-foreground md:text-4xl">Empezá gratis hoy</h2>
            <p className="max-w-sm text-base text-muted-foreground">
              Convertí el tiempo de pantalla en tiempo de aprendizaje. Sin tarjeta, en minutos.
            </p>
            <Link href="/signup">
              <Button className="h-12 px-8 text-base">Crear mi cuenta</Button>
            </Link>
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <div className="relative mt-10 shrink-0 md:mt-0">
              {confetti.map((p, i) => (
                <motion.div
                  key={i}
                  animate={reduced ? {} : { y: [0, p.dy, 0] }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                  style={{
                    position: 'absolute',
                    top: p.top,
                    left: p.left,
                    right: p.right,
                    bottom: p.bottom,
                    width: p.w,
                    height: p.h,
                    backgroundColor: p.color,
                    borderRadius: 0,
                    transform: `rotate(${p.rotate}deg)`,
                  }}
                />
              ))}

              <motion.div
                animate={reduced ? {} : { y: [0, -12, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/robi-feliz.png"
                  alt="Robi feliz"
                  width={300}
                  height={300}
                  className="relative z-10 w-64 object-contain md:w-96"
                />
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
