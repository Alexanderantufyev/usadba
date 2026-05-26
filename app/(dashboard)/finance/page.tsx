import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Финансы' }

export default async function FinancePage() {
  const db = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [paymentsRes, expensesRes] = await Promise.all([
    db.from('payments')
      .select('id, amount, method, is_refund, is_deposit, paid_at, notes, booking:bookings(title)')
      .gte('paid_at', monthStart)
      .lte('paid_at', monthEnd)
      .order('paid_at', { ascending: false })
      .limit(50),
    db.from('expenses')
      .select('id, amount, category, vendor, description, date')
      .gte('date', monthStart.slice(0, 10))
      .lte('date', monthEnd.slice(0, 10))
      .order('date', { ascending: false })
      .limit(50),
  ])

  type PayRow = { id: string; amount: number; method: string; is_refund: boolean; is_deposit: boolean; paid_at: string; notes: string | null; booking: { title: string } | null }
  type ExpRow = { id: string; amount: number; category: string; vendor: string | null; description: string | null; date: string }
  const payments = (paymentsRes.data ?? []) as PayRow[]
  const expenses = (expensesRes.data ?? []) as ExpRow[]

  const totalIn  = payments.filter(p => !p.is_refund).reduce((s, p) => s + p.amount, 0)
  const totalOut = expenses.reduce((s, e) => s + e.amount, 0)
  const profit   = totalIn - totalOut

  const METHOD_RU: Record<string, string> = {
    cash: 'Наличные', card: 'Карта', transfer: 'Перевод', online: 'Онлайн', other: 'Другое',
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Доходы</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-pomor-green)' }}>
            {formatCurrency(totalIn)}
          </p>
        </div>
        <div className="kpi-card">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Расходы</p>
          <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-pomor-red)' }}>
            {formatCurrency(totalOut)}
          </p>
        </div>
        <div className="kpi-card">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Прибыль</p>
          <p className={`text-2xl font-bold mt-2 ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Payments */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
            <ArrowUpRight size={15} className="text-green-600" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Поступления
            </h2>
          </div>
          {!payments.length ? (
            <p className="py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Нет данных</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {p.booking?.title ?? p.notes ?? '—'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {METHOD_RU[p.method] ?? p.method} · {formatDate(p.paid_at)}
                      {p.is_deposit && ' · Депозит'}
                      {p.is_refund && ' · Возврат'}
                    </p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${p.is_refund ? 'text-red-500' : 'text-green-600'}`}>
                    {p.is_refund ? '−' : '+'}{formatCurrency(p.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
            <ArrowDownRight size={15} className="text-red-500" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Расходы
            </h2>
          </div>
          {!expenses.length ? (
            <p className="py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Нет данных</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {expenses.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {e.description ?? e.category}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {e.category}{e.vendor ? ` · ${e.vendor}` : ''} · {formatDate(e.date)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-red-500 shrink-0">
                    −{formatCurrency(e.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
