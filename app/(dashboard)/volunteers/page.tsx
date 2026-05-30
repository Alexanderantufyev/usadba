import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { TaskActions } from './TaskActions'
import { AddTaskDialog } from './AddTaskDialog'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Волонтёры' }

export default async function VolunteersPage() {
  const db = await createClient()

  type TaskRow = {
    id: string; title: string; task_date: string; location: string
    max_volunteers: number; is_active: boolean
    volunteer_registrations: { id: string; name: string; phone: string; email: string; arrival_time: string; created_at: string }[]
  }

  const { data: tasks } = await db
    .from('volunteer_tasks')
    .select(`
      id, title, task_date, location, max_volunteers, is_active,
      volunteer_registrations ( id, name, phone, email, arrival_time, created_at )
    `)
    .order('task_date', { ascending: false })
    .order('created_at', { ascending: true }) as { data: TaskRow[] | null }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Волонтёры</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Задачи и записавшиеся
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/volunteer" target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <ExternalLink size={13} /> Публичная страница
          </a>
          <AddTaskDialog />
        </div>
      </div>

      {tasks?.length === 0 && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Задач пока нет. Нажмите «Добавить задачу».
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tasks?.map((task) => {
          const regs = task.volunteer_registrations ?? []
          const dateLabel = format(new Date(task.task_date + 'T12:00:00'), 'd MMMM yyyy, EEEE', { locale: ru })

          return (
            <div key={task.id} className="glass-card overflow-hidden">
              {/* Task header */}
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b"
                style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {task.title}
                    </h2>
                    {!task.is_active && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                        Скрыта
                      </span>
                    )}
                  </div>
                  <p className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
                    {dateLabel}{task.location ? ` · ${task.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: regs.length >= task.max_volunteers ? 'var(--color-pomor-red)' : 'var(--color-pomor-green)' }}>
                    <Users size={14} />
                    {regs.length} / {task.max_volunteers}
                  </span>
                  <TaskActions taskId={task.id} isActive={task.is_active} />
                </div>
              </div>

              {/* Registrations table */}
              {regs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--color-bg-subtle)' }}>
                        {['Имя', 'Телефон', 'Email', 'Придёт в', 'Записался'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {regs.map((r) => (
                        <tr key={r.id} className="border-t"
                          style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{r.name}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>{r.phone}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>{r.email}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-pomor-green)' }}>
                            {r.arrival_time}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {format(new Date(r.created_at), 'd MMM HH:mm', { locale: ru })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-5 py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Никто ещё не записался
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
