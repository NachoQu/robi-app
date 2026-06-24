'use server'
import { createClient } from '@/lib/supabase/server'

export async function toggleVoucher(id: string, isActive: boolean): Promise<{ ok: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase.from('vouchers').update({ is_active: isActive }).eq('id', id)
  return { ok: !error }
}

export async function updateVoucherPoints(id: string, points: number): Promise<{ ok: boolean }> {
  if (points < 1) return { ok: false }
  const supabase = await createClient()
  const { error } = await supabase.from('vouchers').update({ points_cost: points }).eq('id', id)
  return { ok: !error }
}

export async function redeemVoucher(
  childProfileId: string,
  voucherId: string,
): Promise<{ ok: boolean; newPoints?: number; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_voucher', {
    p_child: childProfileId,
    p_voucher: voucherId,
  })
  if (error) {
    console.error('[redeemVoucher] RPC error:', error.message, error.code, error.details)
    const msg = error.message.includes('insufficient points')
      ? 'No tenés puntos suficientes'
      : error.message.includes('not authorized')
        ? 'No autorizado'
        : 'No se pudo canjear el premio'
    return { ok: false, error: msg }
  }
  const row = Array.isArray(data) ? data[0] : data
  return { ok: true, newPoints: row?.new_total_points ?? undefined }
}
