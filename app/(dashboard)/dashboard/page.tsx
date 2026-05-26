import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/types'
import type { BookingStatus } from '@/lib/types'
import { TrendingUp, TrendingDown, CalendarDays, Users, Banknote, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  const db = await createClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const prevStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const prevEnd    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [thisMonth, prevMonth, upcoming, clients] = await Promise.all([
    db.from('bookings').select('id, final_price, status')
      .gte('starts_at', monthStart).lte('starts_at', monthEnd)
      .is('deleted_at', null),
    db.from('bookings').select('id, final_price, status')
      .gte('starts_at', prevStart).lte('starts_at', prevEnd)
      .is('deleted_at', null),
    db.from('bookings').select('id, title, starts_at, ends_at, status, location:locations(name, color), customer:customers(name)')
      .gte('starts_at', now.toISOString())
      .not('status', 'eq', 'cancelled')
      .is('deleted_at', null)
      .order('starts_at')
      .limit(6),
    db.from('customers').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  type RowSlice = { id: string; final_price: number; status: string }
  const thisList = (thisMonth.data ?? []) as RowSlice[]
  const prevList = (prevMonth.data ?? []) as RowSlice[]

  const revenue      = thisList.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.final_price, 0)
  const prevRevenue  = prevList.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.final_price, 0)
  const bookingCount = thisList.filter(b => b.status !== 'cancelled').length
  const prevCount    = prevList.filter(b => b.status !== 'cancelled').length

  return {
    revenue,
    prevRevenue,
    bookingCount,
    prevCount,
    clientCount: clients.count ?? 0,
    upcomingBookings: upcoming.data ?? [],
  }
}

function Delta({ current, prev, money }: { current: number; prev: number; money?: boolean }) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  const up = pct >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{pct}% к прошлому месяцу
    </span>
  )
}

const STATUS_CLASS: Record<BookingStatus, string> = {
  draft:        'badge-draft',
  confirmed:    'badge-confirmed',
  deposit_paid: 'badge-deposit',
  completed:    'badge-completed',
  cancelled:    'badge-cancelled',
  no_show:      'badge-no_show',
}

export default async function DashboardPage() {
  const { revenue, prevRevenue, bookingCount, prevCount, clientCount, upcomingBookings } = await getStats()

  const kpis = [
    {
      label: 'Выручка за месяц',
      value: formatCurrency(revenue),
      icon: Banknote,
      delta: <Delta current={revenue} prev={prevRevenue} money />,
      accent: 'var(--color-pomor-green)',
    },
    {
      label: 'Бронирований',
      value: bookingCount,
      icon: CalendarDays,
      delta: <Delta current={bookingCount} prev={prevCount} />,
      accent: 'var(--color-pomor-gold)',
    },
    {
      label: 'Клиентов',
      value: clientCount,
      icon: Users,
      delta: null,
      accent: '#6366F1',
    },
    {
      label: 'Средний чек',
      value: bookingCount > 0 ? formatCurrency(Math.round(revenue / bookingCount)) : '—',
      icon: BarChart3,
      delta: null,
      accent: 'var(--color-pomor-red)',
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl">

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, delta, accent }) => (
          <div key={label} className="kpi-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: accent + '18' }}>
                <Icon size={15} style={{ color: accent }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
            {delta}
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Ближайшие бронирования
          </h2>
          <a href="/bookings" className="text-xs font-medium hover:underline"
            style={{ color: 'var(--color-accent)' }}>
            Все →
          </a>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="px-6 py-10 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
            Нет предстоящих бронирований
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {upcomingBookings.map((b: any) => (
              <a key={b.id} href={`/bookings/${b.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--color-bg-subtle)] transition-colors">

                {/* Color dot */}
                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: b.location?.color ?? 'var(--color-pomor-green)' }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {b.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {b.location?.name} · {b.customer?.name ?? 'Без клиента'}
                  </p>
                </div>

                {/* Date */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    {formatDate(b.starts_at)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatTime(b.starts_at)} – {formatTime(b.ends_at)}
                  </p>
                </div>

                {/* Status */}
                <span className={`badge ${STATUS_CLASS[b.status as BookingStatus] ?? 'badge-draft'} hidden sm:inline-flex`}>
                  {BOOKING_STATUS_LABELS[b.status as BookingStatus] ?? b.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
