'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  taskId: string
  taskTitle: string
}

export function RegisterForm({ taskId, taskTitle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ arrival_time: '', name: '', phone: '', email: '' })

  const set = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.arrival_time || !form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Пожалуйста, заполните все поля')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/volunteer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, ...form }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        setError(data.error ?? 'Ошибка при записи')
      }
    } catch {
      setError('Нет связи с сервером')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 py-2">
        <CheckCircle size={20} className="text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Вы записаны!
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Тех задание отправлено на вашу почту
          </p>
        </div>
      </div>
    )
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
        style={{ background: 'var(--color-pomor-green)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-pomor-green-dk)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-pomor-green)')}
      >
        Записаться на «{taskTitle}»
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-pomor-green)' }}>
        Регистрация
      </p>

      <Field label="Во сколько сможете прийти?">
        <input
          type="time" value={form.arrival_time}
          onChange={(e) => set('arrival_time', e.target.value)}
          className="field-input" required
        />
      </Field>

      <Field label="Имя и фамилия">
        <input
          type="text" value={form.name} placeholder="Иванова Мария"
          onChange={(e) => set('name', e.target.value)}
          className="field-input" required
        />
      </Field>

      <Field label="Телефон">
        <input
          type="tel" value={form.phone} placeholder="+7 900 000-00-00"
          onChange={(e) => set('phone', e.target.value)}
          className="field-input" required
        />
      </Field>

      <Field label="Электронная почта">
        <input
          type="email" value={form.email} placeholder="mail@example.ru"
          onChange={(e) => set('email', e.target.value)}
          className="field-input" required
        />
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Туда придёт тех задание и памятка
        </p>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button" onClick={() => setExpanded(false)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--color-pomor-parch)', color: 'var(--color-text-muted)' }}>
          Отмена
        </button>
        <button
          type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: 'var(--color-pomor-green)' }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Отправляем...' : 'Зарегистрироваться'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
