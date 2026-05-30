'use server'

import { createClient } from '@/lib/supabase/server'

export async function createVolunteerTask(form: {
  title: string; description: string; task_date: string
  location: string; tools_info: string; max_volunteers: string
}): Promise<string | null> {
  if (!form.title.trim()) return 'Введите название'
  if (!form.task_date) return 'Укажите дату'

  const db = await createClient()
  const { error } = await db.from('volunteer_tasks').insert({
    title: form.title.trim(),
    description: form.description.trim(),
    task_date: form.task_date,
    location: form.location.trim(),
    tools_info: form.tools_info.trim(),
    max_volunteers: Math.max(1, parseInt(form.max_volunteers) || 10),
  })

  return error ? error.message : null
}

export async function toggleTaskActive(id: string, is_active: boolean) {
  const db = await createClient()
  await db.from('volunteer_tasks').update({ is_active }).eq('id', id)
}

export async function deleteTask(id: string) {
  const db = await createClient()
  await db.from('volunteer_tasks').delete().eq('id', id)
}
