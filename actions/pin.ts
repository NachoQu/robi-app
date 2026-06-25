'use server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

const hash = (pin: string) => createHash('sha256').update(pin).digest('hex')

async function setPin(pin: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  await supabase.from('parent_settings').upsert({ user_id: user.id, pin_hash: hash(pin) })
  return { ok: true }
}

export async function verifyPin(pin: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { data } = await supabase.from('parent_settings').select('pin_hash').eq('user_id', user.id).maybeSingle()
  // primer uso: si no hay PIN configurado, este lo establece
  const cookieOptions = { maxAge: 1800, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
  if (!data?.pin_hash) { await setPin(pin); (await cookies()).set('parent_unlocked', '1', cookieOptions); return { ok: true } }
  if (data.pin_hash === hash(pin)) { (await cookies()).set('parent_unlocked', '1', cookieOptions); return { ok: true } }
  return { ok: false }
}

export async function verifyPassword(password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false }
  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
  if (error) return { ok: false }
  // Re-set the cookie so the layout doesn't redirect after signInWithPassword refreshes the session
  const cookieOptions = { maxAge: 1800, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
  ;(await cookies()).set('parent_unlocked', '1', cookieOptions)
  return { ok: true }
}

export async function updatePin(newPin: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { error } = await supabase.from('parent_settings').upsert({ user_id: user.id, pin_hash: hash(newPin) })
  return { ok: !error }
}

export async function getDisplayName(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('parent_settings').select('display_name').eq('user_id', user.id).maybeSingle()
  return data?.display_name ?? null
}

export async function updateDisplayName(displayName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { error } = await supabase.from('parent_settings').upsert({ user_id: user.id, display_name: displayName.trim() || null })
  return { ok: !error }
}

export async function removePin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { error } = await supabase.from('parent_settings').update({ pin_hash: null }).eq('user_id', user.id)
  return { ok: !error }
}
