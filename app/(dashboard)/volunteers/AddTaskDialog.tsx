'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createVolunteerTask } from './actions'

export function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    title: '', description: '', task_date: '', location: '',
    tools_info: '', max_volunteers: '10',
  })

  const set = (f: keyof typeof form, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const err = await createVolunteerTask(form)
      if (err) { setError(err); return }
      setOpen(false)
      setForm({ title: '', description: '', task_date: '', location: '', tools_info: '', max_volunteers: '10' })
      router.refresh()
    })
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: 'var(--color-pomor-green)' }}>
      <Plus size={15} /> Добавить задачу
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Новая задача</h2>
          <button onClick={() => setOpen(false)}>
            <X size={18} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <F label="Название *">
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Уборка берёзовой аллеи" className="field-input" required />
          </F>
          <F label="Описание">
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Подробнее о задаче..." rows={3} className="field-input resize-none" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Дата *">
              <input type="date" value={form.task_date} onChange={(e) => set('task_date', e.target.value)}
                className="field-input" required />
            </F>
            <F label="Макс. волонтёров">
              <input type="number" value={form.max_volunteers} min="1"
                onChange={(e) => set('max_volunteers', e.target.value)} className="field-input" />
            </F>
          </div>
          <F label="Место">
            <input value={form.location} onChange={(e) => set('location', e.target.value)}
              placeholder="Берёзовая аллея, ворота №3" className="field-input" />
          </F>
          <F label="Инструменты / что взять с собой">
            <input value={form.tools_info} onChange={(e) => set('tools_info', e.target.value)}
              placeholder="Перчатки, грабли, мусорные мешки" className="field-input" />
          </F>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              Отмена
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-pomor-green)', opacity: pending ? 0.7 : 1 }}>
              {pending && <Loader2 size={14} className="animate-spin" />}
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
