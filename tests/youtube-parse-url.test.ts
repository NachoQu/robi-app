import { describe, it, expect } from 'vitest'
import { parseYoutubeId } from '@/lib/youtube/parse-url'

describe('parseYoutubeId', () => {
  it('extrae id de watch?v=', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae id de youtu.be', () => {
    expect(parseYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('extrae id de /shorts/', () => {
    expect(parseYoutubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })
  it('devuelve null para URL no-YouTube', () => {
    expect(parseYoutubeId('https://vimeo.com/123')).toBeNull()
  })
})
