'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

interface RobiFloatingImageProps {
  size?: number
  className?: string
}

export function RobiFloatingImage({ size = 48, className }: RobiFloatingImageProps) {
  const reduced = useReducedMotion() ?? false

  return (
    <motion.div
      className={className}
      animate={reduced ? {} : { y: [0, -6, 0, -3, 0] }}
      transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <Image
        src="/robi-default.png"
        alt="Robi"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </motion.div>
  )
}
