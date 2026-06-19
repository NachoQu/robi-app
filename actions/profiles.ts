'use server'
import { createClient } from '@/lib/supabase/server'

const FREE_PROFILE_LIMIT = 1

export async function createProfile(input: { name: string; avatar: string; age?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'No autenticado' }
  const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  if ((count ?? 0) >= FREE_PROFILE_LIMIT) return { ok: false, reason: 'La versión gratuita permite 1 perfil. Pasá a la versión paga para agregar más.' }
  const { data, error } = await supabase.from('child_profiles')
    .insert({ user_id: user.id, name: input.name, avatar: input.avatar, age: input.age }).select('id').single()
  if (error) return { ok: false, reason: error.message }
  return { ok: true, profileId: data.id }
}
