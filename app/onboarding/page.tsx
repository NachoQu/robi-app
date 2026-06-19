import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (data && data.length > 0) {
      redirect('/')
    }
  }

  return <OnboardingForm />
}
