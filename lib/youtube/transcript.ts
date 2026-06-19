export async function fetchTranscript(youtubeId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${youtubeId}&text=true`,
      { headers: { 'x-api-key': process.env.SUPADATA_API_KEY! }, signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const content = typeof data.content === 'string' ? data.content : ''
    return content.trim().length > 0 ? content : null
  } catch {
    return null
  }
}
