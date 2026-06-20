'use server'
import { createClient } from '@/lib/supabase/server'

export async function toggleVoucher(id: string, isActive: boolean): Promise<{ ok: boolean }> {
  const supabase = await createClient()
  await supabase.from('vouchers').update({ is_active: isActive }).eq('id', id)
  return { ok: true }
}
