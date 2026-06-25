'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export type FeedItem =
  | { kind: 'activity'; id: string; date: string; childName: string; childAvatar: string; videoTitle: string; points: number }
  | { kind: 'watch'; id: string; date: string; childName: string; childAvatar: string; videoTitle: string }
  | { kind: 'redemption'; id: string; date: string; childName: string; childAvatar: string; voucherTitle: string }

const INITIAL_COUNT = 3

export function FeedList({ items }: { items: FeedItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, INITIAL_COUNT)
  const hasMore = items.length > INITIAL_COUNT

  return (
    <div className="flex flex-col gap-2">
      {visible.map((item) => {
        const dateStr = new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

        if (item.kind === 'activity') {
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3.5">
              <span className="text-2xl shrink-0">{item.childAvatar}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{item.childName}</p>
                  <span className="text-xs font-bold text-foreground">✅ completó el quiz</span>
                  <span className="text-xs text-muted-foreground">· {dateStr}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.videoTitle}</p>
              </div>
            </div>
          )
        }

        if (item.kind === 'watch') {
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3.5">
              <span className="text-2xl shrink-0">{item.childAvatar}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{item.childName}</p>
                  <span className="text-xs font-bold text-foreground">👀 vio un video</span>
                  <span className="text-xs text-muted-foreground">· {dateStr}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.videoTitle}</p>
              </div>
            </div>
          )
        }

        return (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3.5">
            <span className="text-2xl shrink-0">{item.childAvatar}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-foreground">{item.childName}</p>
                <span className="text-xs font-bold text-foreground">🎁 canjeó un premio</span>
                <span className="text-xs text-muted-foreground">· {dateStr}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{item.voucherTitle}</p>
            </div>
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
        >
          {expanded ? (
            <><ChevronUp size={15} /> Ver menos</>
          ) : (
            <><ChevronDown size={15} /> Ver toda la actividad ({items.length - INITIAL_COUNT} más)</>
          )}
        </button>
      )}
    </div>
  )
}
