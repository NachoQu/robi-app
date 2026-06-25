import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountClient } from './account-client'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: settings } = await supabase
    .from('parent_settings')
    .select('pin_hash, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Cuenta</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">Configuración de tu cuenta</p>
      </div>

      <AccountClient
        email={user.email ?? ''}
        hasPin={!!(settings?.pin_hash)}
        displayName={settings?.display_name ?? ''}
      />
    </div>
  )
}
