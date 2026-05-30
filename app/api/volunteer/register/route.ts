import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { task_id, arrival_time, name, phone, email } = body

  if (!task_id || !arrival_time || !name?.trim() || !phone?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }

  const db = await createClient()

  // Get task info
  const { data: task } = await db
    .from('volunteer_tasks')
    .select('id, title, task_date, location, tools_info, max_volunteers')
    .eq('id', task_id)
    .single()

  if (!task) {
    return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
  }

  // Check seats
  const { count } = await db
    .from('volunteer_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('task_id', task_id)

  if ((count ?? 0) >= task.max_volunteers) {
    return NextResponse.json({ error: 'Все места заняты' }, { status: 409 })
  }

  // Check duplicate
  const { data: dup } = await db
    .from('volunteer_registrations')
    .select('id')
    .eq('task_id', task_id)
    .eq('email', email.trim())
    .maybeSingle()

  if (dup) {
    return NextResponse.json({ error: 'Вы уже записаны на эту задачу' }, { status: 409 })
  }

  // Save registration
  const { error: insertErr } = await db.from('volunteer_registrations').insert({
    task_id,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    arrival_time,
  })

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      const dateLabel = format(new Date(task.task_date + 'T12:00:00'), 'd MMMM yyyy (EEEE)', { locale: ru })
      const fromEmail = process.env.RESEND_FROM ?? 'noreply@updates.pomortsy.ru'

      await resend.emails.send({
        from: fromEmail,
        to: email.trim(),
        subject: `Вы записаны на волонтёрские работы — ${task.title}`,
        html: buildEmail({ name: name.trim(), taskTitle: task.title, dateLabel, location: task.location, arrivalTime: arrival_time, toolsInfo: task.tools_info }),
      })
    } catch (e) {
      console.error('Resend error:', e)
      // Don't fail the registration if email fails
    }
  }

  return NextResponse.json({ ok: true })
}

function buildEmail(p: {
  name: string; taskTitle: string; dateLabel: string
  location: string; arrivalTime: string; toolsInfo: string
}) {
  return `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Подтверждение записи</title></head>
<body style="margin:0;padding:0;background:#F0E8D5;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0F3D31;padding:28px 32px;">
      <p style="margin:0;color:rgba(240,232,213,0.6);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Усадьба — волонтёрство</p>
      <h1 style="margin:8px 0 0;color:#F0E8D5;font-size:22px;font-weight:700;line-height:1.3;">
        Вы записаны!
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="margin:0 0 20px;color:#14100C;font-size:15px;">
        Здравствуйте, <strong>${p.name}</strong>!<br>
        Ваша запись на волонтёрскую работу подтверждена.
      </p>

      <!-- Task card -->
      <div style="background:#E8F2EF;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#1B6255;text-transform:uppercase;letter-spacing:1px;">Ваша задача</p>
        <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#0F3D31;">${p.taskTitle}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6B6355;font-size:13px;width:120px;">📅 Дата</td>
            <td style="padding:4px 0;color:#14100C;font-size:13px;font-weight:500;text-transform:capitalize;">${p.dateLabel}</td>
          </tr>
          ${p.location ? `<tr>
            <td style="padding:4px 0;color:#6B6355;font-size:13px;">📍 Место</td>
            <td style="padding:4px 0;color:#14100C;font-size:13px;font-weight:500;">${p.location}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:4px 0;color:#6B6355;font-size:13px;">🕐 Приду в</td>
            <td style="padding:4px 0;color:#14100C;font-size:13px;font-weight:500;">${p.arrivalTime}</td>
          </tr>
          ${p.toolsInfo ? `<tr>
            <td style="padding:4px 0;color:#6B6355;font-size:13px;vertical-align:top;">🔧 Взять с собой</td>
            <td style="padding:4px 0;color:#14100C;font-size:13px;font-weight:500;">${p.toolsInfo}</td>
          </tr>` : ''}
        </table>
      </div>

      <p style="margin:0 0 8px;color:#14100C;font-size:14px;">
        Если у вас возникнут вопросы — напишите нам в группу ВКонтакте.
      </p>
      <p style="margin:0;color:#6B6355;font-size:13px;">
        Спасибо, что помогаете усадьбе! 🌿
      </p>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #EDE5D0;background:#FAF6EE;">
      <p style="margin:0;color:#B0A892;font-size:11px;text-align:center;">Усадьба · Поморцы</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
