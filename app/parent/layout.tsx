import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ParentShell } from '@/components/shell/parent-shell'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('parent_unlocked')

  if (!unlocked) {
    // Allow access when the user has NOT configured a PIN yet (first-time flow).
    // Once a PIN is set, the cookie gate is enforced.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/')
    }

    const { data: settings } = await supabase
      .from('parent_settings')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle()

    const hasPinConfigured = !!(settings?.pin_hash)

    if (hasPinConfigured) {
      // PIN exists but cookie is absent → redirect to unlock screen
      redirect('/')
    }
    // No PIN configured → allow through (new user, first-time onboarding flow)
  }

  return <ParentShell>{children}</ParentShell>
}
