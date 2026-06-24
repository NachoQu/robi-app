'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function traducirError(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('email not confirmed')) return 'Confirmá tu email antes de iniciar sesión.'
  if (msg.includes('user already registered') || msg.includes('already registered')) return 'Ya existe una cuenta con ese email.'
  if (msg.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('unable to validate email') || msg.includes('invalid format')) return 'El formato del email no es válido.'
  if (msg.includes('email rate limit') || msg.includes('rate limit')) return 'Demasiados intentos. Esperá un momento e intentá de nuevo.'
  if (msg.includes('signup is disabled')) return 'El registro está temporalmente desactivado.'
  if (msg.includes('weak password')) return 'La contraseña es muy débil. Usá al menos 6 caracteres.'
  return 'Ocurrió un error. Intentá de nuevo.'
}

const SEED_VOUCHERS = [
  { title: '30 min más de pantalla', description: 'Tiempo extra hoy', points_cost: 50 },
  { title: 'Elegir la cena', description: 'Vos elegís el menú', points_cost: 80 },
  { title: 'Elegir la película del viernes', description: 'Noche de cine familiar', points_cost: 100 },
  { title: 'Noche de pijamas en el living', description: 'Campamento indoor', points_cost: 120 },
  { title: 'Una hora de juego con mamá/papá', description: 'Tiempo exclusivo', points_cost: 150 },
  { title: 'Traer un amigo a dormir', description: 'Pijamada', points_cost: 200 },
]

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: traducirError(error.message) }
  if (data.user) {
    await supabase.from('vouchers').insert(SEED_VOUCHERS.map((v) => ({ ...v, user_id: data.user!.id })))
  }
  redirect('/onboarding')
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: traducirError(error.message) }
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function sendPasswordResetEmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false }
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })
  if (error) return { ok: false }
  return { ok: true }
}
