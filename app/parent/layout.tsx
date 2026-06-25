import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ParentShell } from '@/components/shell/parent-shell'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('parent_unlocked')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  if (!unlocked) {
    const { data: settings } = await supabase
      .from('parent_settings')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settings?.pin_hash) redirect('/')
  }

  const { data: settings2 } = await supabase
    .from('parent_settings')
    .select('display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  return <ParentShell userEmail={user.email ?? ''} displayName={settings2?.display_name ?? null}>{children}</ParentShell>
}
