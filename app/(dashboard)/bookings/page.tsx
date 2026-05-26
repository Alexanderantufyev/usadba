import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { BOOKING_STATUS_LABELS, BOOKING_TYPE_LABELS } from '@/lib/types'
import type { BookingStatus, BookingType } from '@/lib/types'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Бронирования' }

const STATUS_CLASS: Record<BookingStatus, string> = {
  draft:        'badge-draft',
  confirmed:    'badge-confirmed',
  deposit_paid: 'badge-deposit',
  completed:    'badge-completed',
  cancelled:    'badge-cancelled',
  no_show:      'badge-no_show',
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const PAGE_SIZE = 25
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const db = await createClient()
  let query = db
    .from('bookings')
    .select('id, title, type, status, starts_at, ends_at, final_price, guests_count, location:locations(name, color), customer:customers(name)', { count: 'exact' })
    .is('deleted_at', null)
    .order('starts_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)

  const { data: bookings, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {[undefined, 'confirmed', 'deposit_paid', 'completed', 'cancelled'].map((s) => (
            <Link key={s ?? 'all'} href={s ? `/bookings?status=${s}` : '/bookings'}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                status === s || (!status && !s)
                  ? 'border-[var(--color-pomor-green)] text-[var(--color-pomor-green)] bg-[var(--color-pomor-green-soft)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-pomor-green)]'
              }`}>
              {s ? BOOKING_STATUS_LABELS[s as BookingStatus] : 'Все'}
            </Link>
          ))}
        </div>

        <Link href="/bookings/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ background: 'var(--color-pomor-green)' }}>
          <Plus size={14} />
          Новое
        </Link>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {!bookings?.length ? (
          <p className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Нет бронирований
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  {['Название', 'Пространство', 'Клиент', 'Дата', 'Тип', 'Статус', 'Сумма'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                      style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/bookings/${b.id}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--color-text)' }}>
                        {b.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: b.location?.color ?? '#1B6255' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>{b.location?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
                      {b.customer?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {formatDate(b.starts_at)}
                      <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatTime(b.starts_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
                      {BOOKING_TYPE_LABELS[b.type as BookingType] ?? b.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_CLASS[b.status as BookingStatus] ?? 'badge-draft'}`}>
                        {BOOKING_STATUS_LABELS[b.status as BookingStatus] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text)' }}>
                      {formatCurrency(b.final_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-text-muted)' }}>
            Всего: {count}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/bookings?page=${page - 1}${status ? `&status=${status}` : ''}`}
                className="px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                ← Назад
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/bookings?page=${page + 1}${status ? `&status=${status}` : ''}`}
                className="px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                Вперёд →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
