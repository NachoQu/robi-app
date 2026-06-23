import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RewardsClient from './rewards-client'

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default async function RewardsPage({ params }: PageProps) {
  const { profileId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points, user_id')
    .eq('id', profileId)
    .single()

  if (!profile) notFound()

  const { data: vouchersRaw } = await supabase
    .from('vouchers')
    .select('id, title, description, points_cost')
    .eq('user_id', profile.user_id)
    .eq('is_active', true)
    .order('points_cost', { ascending: true })

  const { data: redemptionsRaw } = await supabase
    .from('redemptions')
    .select('id, voucher_id, redeemed_at, vouchers(title, points_cost)')
    .eq('child_profile_id', profileId)
    .order('redeemed_at', { ascending: false })

  type VoucherRow = { id: string; title: string; description: string | null; points_cost: number }
  type RedemptionRow = {
    id: string
    voucher_id: string
    redeemed_at: string
    voucher_title: string
    voucher_points_cost: number
  }

  const vouchers: VoucherRow[] = ((vouchersRaw ?? []) as unknown as VoucherRow[])

  const redemptions: RedemptionRow[] = ((redemptionsRaw ?? []) as unknown as Array<{
    id: string
    voucher_id: string
    redeemed_at: string
    vouchers: { title: string; points_cost: number } | null
  }>).map((r) => ({
    id: r.id,
    voucher_id: r.voucher_id,
    redeemed_at: r.redeemed_at,
    voucher_title: r.vouchers?.title ?? 'Premio',
    voucher_points_cost: r.vouchers?.points_cost ?? 0,
  }))

  return (
    <RewardsClient
      profileId={profileId}
      profileName={profile.name}
      profileAvatar={profile.avatar}
      totalPoints={profile.total_points}
      vouchers={vouchers}
      redemptions={redemptions}
    />
  )
}
