import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RewardsClient from './rewards-client'

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default async function RewardsPage({ params }: PageProps) {
  const { profileId } = await params
  const supabase = await createClient()

  // Load profile (includes total_points and user_id for vouchers lookup)
  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points, user_id')
    .eq('id', profileId)
    .single()

  if (!profile) notFound()

  // Load active vouchers belonging to the parent (user_id)
  const { data: vouchersRaw } = await supabase
    .from('vouchers')
    .select('id, title, description, points_cost')
    .eq('user_id', profile.user_id)
    .eq('is_active', true)
    .order('points_cost', { ascending: true })

  type VoucherRow = {
    id: string
    title: string
    description: string | null
    points_cost: number
  }
  const vouchers: VoucherRow[] = ((vouchersRaw ?? []) as unknown as VoucherRow[])

  return (
    <RewardsClient
      profileId={profileId}
      profileName={profile.name}
      profileAvatar={profile.avatar}
      totalPoints={profile.total_points}
      vouchers={vouchers}
    />
  )
}
