import Image from 'next/image'
import { cn } from '@/lib/utils'

export const BADGE_ICONS = [
  '/badge-icon-1.png',
  '/badge-icon-2.png',
  '/badge-icon-3.png',
  '/badge-icon-4.png',
  '/badge-icon-5.png',
  '/badge-icon-6.png',
]

export function AchievementBadge({
  imageSrc,
  locked = false,
  size = 56,
  className,
}: {
  imageSrc: string
  locked?: boolean
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-label={locked ? 'Logro bloqueado' : 'Logro desbloqueado'}
    >
      <Image
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        style={{
          objectFit: 'contain',
          filter: locked ? 'grayscale(1) opacity(0.4)' : 'none',
        }}
      />
    </span>
  )
}
