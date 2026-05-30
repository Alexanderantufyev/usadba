import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { addDays, startOfWeek, format, isSameDay, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const dynamic = 'force-dynamic'

export default async function VolunteerWeekPage() {
  const db = await createClient()
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const from = format(days[0], 'yyyy-MM-dd')
  const to   = format(days[6], 'yyyy-MM-dd')

  const { data: tasks } = await db
    .from('volunteer_tasks')
    .select('id, title, task_date, location, max_volunteers')
    .eq('is_active', true)
    .gte('task_date', from)
    .lte('task_date', to)
    .order('task_date')

  const tasksByDate = (tasks ?? []).reduce<Record<string, typeof tasks>>((acc, t) => {
    const d = t!.task_date
    acc[d] = [...(acc[d] ?? []), t]
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-pomor-green-dk)' }}>
          Волонтёрские работы
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Выберите день и запишитесь на задачу
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDate[dateKey] ?? []
          const isCurrentDay = isToday(day)
          const isPast = day < today && !isToday(day)

          return (
            <Link
              key={dateKey}
              href={`/volunteer/${dateKey}`}
              className={`block rounded-2xl border-2 p-4 transition-all ${
                isPast
                  ? 'opacity-50 cursor-default pointer-events-none'
                  : 'hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{
                borderColor: isCurrentDay ? 'var(--color-pomor-green)' : 'var(--color-pomor-parch-dk)',
                background: isCurrentDay ? 'var(--color-pomor-green-soft)' : 'var(--color-surface)',
              }}
            >
              {/* Day header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: isCurrentDay ? 'var(--color-pomor-green)' : 'var(--color-text-muted)' }}>
                    {DAY_NAMES[i]}
                  </p>
                  <p className="text-3xl font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
                    {format(day, 'd')}
                  </p>
                  <p className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
                    {format(day, 'LLLL', { locale: ru })}
                  </p>
                </div>
                {dayTasks.length > 0 && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: 'var(--color-pomor-green)', color: 'white' }}>
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Task previews */}
              {dayTasks.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Задач нет</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <div key={t!.id}
                      className="text-xs px-2 py-1.5 rounded-lg font-medium truncate"
                      style={{ background: 'var(--color-pomor-parch)', color: 'var(--color-pomor-green-dk)' }}>
                      {t!.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      +ещё {dayTasks.length - 3}
                    </p>
                  )}
                </div>
              )}

              {isCurrentDay && (
                <p className="text-[10px] font-semibold mt-3 uppercase tracking-wider"
                  style={{ color: 'var(--color-pomor-green)' }}>
                  Сегодня
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
