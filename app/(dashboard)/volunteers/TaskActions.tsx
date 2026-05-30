'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { toggleTaskActive, deleteTask } from './actions'

export function TaskActions({ taskId, isActive }: { taskId: string; isActive: boolean }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const toggle = () => start(async () => {
    await toggleTaskActive(taskId, !isActive)
    router.refresh()
  })

  const remove = () => {
    if (!confirm('Удалить задачу? Все регистрации тоже удалятся.')) return
    start(async () => {
      await deleteTask(taskId)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={toggle} disabled={pending} title={isActive ? 'Скрыть' : 'Показать'}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-bg-subtle)]"
        style={{ color: 'var(--color-text-muted)' }}>
        {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button onClick={remove} disabled={pending} title="Удалить"
        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
        style={{ color: 'var(--color-text-muted)' }}>
        <Trash2 size={14} />
      </button>
    </div>
  )
}
