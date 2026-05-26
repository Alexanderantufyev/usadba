import { createClient } from '@/lib/supabase/server'
import { CalendarView } from './CalendarView'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Календарь' }

export default async function CalendarPage() {
  const db = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()

  const [bookingsRes, locationsRes] = await Promise.all([
    db.from('bookings')
      .select('id, title, starts_at, ends_at, status, color, all_day, location_id, location:locations(name, color)')
      .gte('starts_at', monthStart)
      .lte('ends_at', monthEnd)
      .not('status', 'eq', 'cancelled')
      .is('deleted_at', null)
      .order('starts_at'),
    db.from('locations').select('id, name, color').eq('is_active', true).order('sort_order'),
  ])

  return (
    <CalendarView
      bookings={bookingsRes.data ?? []}
      locations={locationsRes.data ?? []}
    />
  )
}
