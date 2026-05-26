'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/types'
import type { BookingStatus } from '@/lib/types'

type Booking = {
  id: string
  title: string
  starts_at: string
  ends_at: string
  status: string
  color: string | null
  all_day: boolean
  location_id: string
  location?: { name: string; color: string } | null
}

type Location = { id: string; name: string; color: string }

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

export function CalendarView({ bookings, locations }: { bookings: Booking[]; locations: Location[] }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const filtered = useMemo(() =>
    selectedLocation ? bookings.filter(b => b.location_id === selectedLocation) : bookings,
    [bookings, selectedLocation]
  )

  // Build calendar grid (Mon-start)
  const year  = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Mon = 0 offset
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells  = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(year, month, i - startOffset + 1)
    return d
  })

  const bookingsByDay = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    for (const b of filtered) {
      const key = b.starts_at.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(b)
    }
    return map
  }, [filtered])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4">

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            <ChevronLeft size={15} />
          </button>
          <h2 className="text-base font-semibold min-w-36 text-center" style={{ color: 'var(--color-text)' }}>
            {MONTHS_RU[month]} {year}
          </h2>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => setCurrent(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="px-3 h-8 text-xs rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Сегодня
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSelectedLocation(null)}
            className={`px-3 h-7 rounded-lg text-xs border transition-colors ${!selectedLocation ? 'border-[var(--color-pomor-green)] text-[var(--color-pomor-green)] bg-[var(--color-pomor-green-soft)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            Все
          </button>
          {locations.map(loc => (
            <button key={loc.id} onClick={() => setSelectedLocation(loc.id === selectedLocation ? null : loc.id)}
              className={`px-3 h-7 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${selectedLocation === loc.id ? 'border-current' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
              style={selectedLocation === loc.id ? { color: loc.color, borderColor: loc.color, background: loc.color + '18' } : {}}>
              <span className="w-2 h-2 rounded-full" style={{ background: loc.color }} />
              {loc.name}
            </button>
          ))}

          <Link href="/bookings/new"
            className="flex items-center gap-1 h-8 px-3 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-pomor-green)' }}>
            <Plus size={13} />
            Добавить
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {DAYS_RU.map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-semibold"
              style={{ color: 'var(--color-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 auto-rows-fr" style={{ minHeight: '480px' }}>
          {cells.map((date, i) => {
            const key    = date.toISOString().slice(0, 10)
            const isThis = date.getMonth() === month
            const isToday = key === today
            const dayBookings = bookingsByDay[key] ?? []

            return (
              <div key={i}
                className={`border-r border-b p-1.5 min-h-24 ${!isThis ? 'opacity-30' : ''}`}
                style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full mb-1 ${isToday ? 'text-white' : ''}`}
                  style={isToday ? { background: 'var(--color-pomor-green)' } : { color: 'var(--color-text-muted)' }}>
                  {date.getDate()}
                </div>

                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map(b => (
                    <Link key={b.id} href={`/bookings/${b.id}`}
                      className="block truncate text-[10px] px-1.5 py-0.5 rounded font-medium leading-tight"
                      style={{
                        background: (b.color ?? b.location?.color ?? '#1B6255') + '28',
                        color: b.color ?? b.location?.color ?? '#1B6255',
                      }}
                      title={`${b.title} · ${formatTime(b.starts_at)}`}>
                      {b.all_day ? '' : `${formatTime(b.starts_at)} `}{b.title}
                    </Link>
                  ))}
                  {dayBookings.length > 3 && (
                    <p className="text-[10px] px-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      +{dayBookings.length - 3} ещё
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
