'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  if (error) return { error: error.message }
  if (data.user) {
    await supabase.from('vouchers').insert(SEED_VOUCHERS.map((v) => ({ ...v, user_id: data.user!.id })))
  }
  redirect('/onboarding')
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
