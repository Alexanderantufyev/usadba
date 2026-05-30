import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, parse, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Users, Wrench, ArrowLeft } from 'lucide-react'
import { RegisterForm } from './RegisterForm'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ date: string }> }

export default async function VolunteerDayPage({ params }: Props) {
  const { date } = await params
  const parsed = parse(date, 'yyyy-MM-dd', new Date())
  if (!isValid(parsed)) notFound()

  const db = await createClient()
  type TaskRow = {
    id: string; title: string; description: string; task_date: string
    location: string; tools_info: string; max_volunteers: number
    volunteer_registrations: { id: string }[]
  }

  const { data: tasks } = await db
    .from('volunteer_tasks')
    .select(`
      id, title, description, task_date, location, tools_info, max_volunteers,
      volunteer_registrations ( id )
    `)
    .eq('task_date', date)
    .eq('is_active', true)
    .order('created_at') as { data: TaskRow[] | null }

  const dateLabel = format(parsed, 'd MMMM yyyy, EEEE', { locale: ru })

  return (
    <div>
      <Link href="/volunteer"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: 'var(--color-pomor-green)' }}>
        <ArrowLeft size={14} /> Назад к неделе
      </Link>

      <h1 className="text-xl font-bold capitalize mb-1" style={{ color: 'var(--color-pomor-green-dk)' }}>
        {dateLabel}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {tasks?.length
          ? `${tasks.length} задач${tasks.length === 1 ? 'а' : tasks.length < 5 ? 'и' : ''} — выберите одну и запишитесь`
          : 'На этот день задач нет'}
      </p>

      {tasks?.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center"
          style={{ borderColor: 'var(--color-pomor-parch-dk)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Задач пока не запланировано</p>
        </div>
      )}

      <div className="space-y-4">
        {tasks?.map((task) => {
          const taken = task.volunteer_registrations?.length ?? 0
          const spots = task.max_volunteers - taken
          const full = spots <= 0

          return (
            <div key={task.id}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: 'var(--color-pomor-parch-dk)', background: 'var(--color-surface)' }}>

              {/* Task header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                    {task.title}
                  </h2>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    full ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {full ? 'Мест нет' : `Мест: ${spots}`}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {task.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> {task.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users size={12} /> {taken} / {task.max_volunteers} волонтёров
                  </span>
                  {task.tools_info && (
                    <span className="flex items-center gap-1.5">
                      <Wrench size={12} /> {task.tools_info}
                    </span>
                  )}
                </div>
              </div>

              {/* Registration form */}
              {!full && (
                <div className="border-t px-5 py-4"
                  style={{ borderColor: 'var(--color-pomor-parch-dk)', background: 'var(--color-bg-subtle)' }}>
                  <RegisterForm taskId={task.id} taskTitle={task.title} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
