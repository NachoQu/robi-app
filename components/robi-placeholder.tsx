import { Robi, type RobiMood } from '@/components/robi/Robi'

interface RobiPlaceholderProps {
  size?: number
  className?: string
  mood?: RobiMood
}

/**
 * Shared Robi placeholder — now renders the real animated <Robi /> mascot.
 * All existing call-sites keep working; pass `mood` for context-specific animation.
 */
export function RobiPlaceholder({ size = 80, className, mood = 'idle' }: RobiPlaceholderProps) {
  return <Robi size={size} className={className} mood={mood} />
}
