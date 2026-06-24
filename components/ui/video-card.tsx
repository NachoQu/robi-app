import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { StatusChip, type StatusKind } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'

export function VideoCard({
  href,
  title,
  thumbnailUrl,
  duration,
  status,
  className,
}: {
  href: string
  title: string
  thumbnailUrl: string
  duration?: string
  status?: StatusKind
  className?: string
}) {
  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm border border-border transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02]">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={thumbnailUrl} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
          <div className="absolute inset-0 flex items-center justify-center opacity-80 transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex size-11 items-center justify-center rounded-full bg-black/50 transition-transform duration-200 group-hover:scale-110">
              <Play size={20} className="ml-0.5 text-white" fill="white" />
            </span>
          </div>
          {duration && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">
              {duration}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-3">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{title}</p>
          {status && <StatusChip status={status} />}
        </div>
      </div>
    </Link>
  )
}
