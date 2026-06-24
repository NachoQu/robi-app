import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomeClient } from '@/components/home-client'
import { Landing } from '@/components/landing/landing'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <Landing />

  const [{ data: profiles }, { data: parentSettings }] = await Promise.all([
    supabase
      .from('child_profiles')
      .select('id, name, avatar, total_points')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('parent_settings')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!profiles || profiles.length === 0) {
    redirect('/onboarding')
  }

  const hasPin = Boolean(parentSettings?.pin_hash)

  return (
    <HomeClient
      profiles={profiles as { id: string; name: string; avatar: string; total_points: number }[]}
      hasPin={hasPin}
      userEmail={user.email ?? ''}
    />
  )
}
