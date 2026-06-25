'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Link, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RobiPlaceholder } from '@/components/robi-placeholder'

export function AddVideoShortcut() {
  const [url, setUrl] = useState('')
  const [placeholder, setPlaceholder] = useState('Pegá el link de YouTube')
  const router = useRouter()

  useEffect(() => {
    const update = () => setPlaceholder(window.innerWidth >= 1024 ? 'Pegá el link de YouTube de YouTube aquí...' : 'Pegá el link de YouTube')
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function handleAgregar() {
    const params = new URLSearchParams({ from: 'videos' })
    if (url.trim()) params.set('url', url.trim())
    router.push(`/parent/add-video?${params.toString()}`)
  }

  return (
    <div className="rounded-2xl bg-card border border-border px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary shrink-0">
          <Video size={16} strokeWidth={2.5} />
        </span>
        <h2 className="text-base font-bold text-foreground">Agregar nuevo video</h2>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="url"
            placeholder={placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            className="pl-8 h-11 rounded-xl text-sm border-border focus-visible:ring-0 focus-visible:border-primary"
            autoComplete="off"
          />
        </div>
        <Button
          variant="primary"
          className="h-11 px-4 shrink-0 flex items-center gap-1.5 font-bold"
          onClick={handleAgregar}
        >
          <Plus size={15} strokeWidth={2.5} />
          Agregar
        </Button>
      </div>

      <div
        className="hidden lg:flex items-start gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: 'color-mix(in oklch, var(--robi-secondary) 10%, transparent)',
          border: '1px solid color-mix(in oklch, var(--robi-secondary) 20%, transparent)',
        }}
      >
        <RobiPlaceholder size={20} className="shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-muted-foreground">
          <span className="font-bold" style={{ color: 'var(--robi-primary)' }}>Consejo de Robi: </span>
          Los videos de menos de 5 minutos tienen mayor tasa de finalización.
        </p>
      </div>
    </div>
  )
}
