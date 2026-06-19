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
