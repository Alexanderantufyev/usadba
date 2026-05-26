import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Users, Square, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Пространства' }

export default async function LocationsPage() {
  const db = await createClient()
  const { data: locations } = await db
    .from('locations')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order')

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {locations?.length ?? 0} пространств
        </p>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--color-pomor-green)' }}>
          <Plus size={14} />
          Добавить
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {locations?.map(loc => (
          <div key={loc.id} className="glass-card p-5 flex flex-col gap-4">
            {/* Header with color */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: loc.color + '22' }}>
                  <MapPin size={18} style={{ color: loc.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{loc.name}</p>
                  {loc.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                      {loc.description}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loc.is_active ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                {loc.is_active ? 'Активно' : 'Закрыто'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {loc.capacity && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Users size={12} />
                  {loc.capacity} чел.
                </div>
              )}
              {loc.area_sqm && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Square size={12} />
                  {loc.area_sqm} м²
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="pt-3 border-t flex justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Час
                </p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  {formatCurrency(loc.hourly_rate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  День
                </p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                  {formatCurrency(loc.daily_rate)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
