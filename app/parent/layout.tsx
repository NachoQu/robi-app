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

  return <ParentShell userEmail={user.email ?? ''}>{children}</ParentShell>
}
