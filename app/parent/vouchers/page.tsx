import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VoucherList from './voucher-list'

export interface Voucher {
  id: string
  title: string
  description: string | null
  points_cost: number
  is_active: boolean
}

export default async function VouchersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-base text-muted-foreground font-medium">Sesión no encontrada.</p>
      </div>
    )
  }

  const { data } = await supabase
    .from('vouchers')
    .select('id, title, description, points_cost, is_active')
    .eq('user_id', user.id)
    .order('points_cost', { ascending: true })

  const vouchers: Voucher[] = data ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Back link + title */}
      <div className="flex flex-col gap-1">
<h1 className="text-2xl font-extrabold tracking-tight mt-2" style={{ color: 'var(--foreground)' }}>
          Gestionar premios
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Activá los premios que tu hijo/a puede canjear con sus puntos. Los premios inactivos no aparecen en el catálogo.
        </p>
      </div>

      <VoucherList initialVouchers={vouchers} />
    </div>
  )
}
