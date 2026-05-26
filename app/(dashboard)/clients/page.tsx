import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Plus, Star } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Клиенты' }

export default async function ClientsPage() {
  const db = await createClient()
  const { data: customersRaw } = await db
    .from('customers')
    .select('id, name, phone, email, company, is_vip, tags, created_at')
    .is('deleted_at', null)
    .order('name')
  const customers = (customersRaw ?? []) as Array<{
    id: string; name: string; phone: string | null; email: string | null
    company: string | null; is_vip: boolean; tags: string[]; created_at: string
  }>

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {customers?.length ?? 0} клиентов
        </p>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--color-pomor-green)' }}>
          <Plus size={14} />
          Добавить клиента
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {!customers.length ? (
          <p className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Нет клиентов
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {customers.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-bg-subtle)] transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'var(--color-pomor-green)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                    {c.is_vip && <Star size={12} fill="currentColor" style={{ color: 'var(--color-pomor-gold)' }} />}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {[c.company, c.phone, c.email].filter(Boolean).join(' · ')}
                  </p>
                </div>

                {c.tags?.length > 0 && (
                  <div className="hidden sm:flex gap-1.5 flex-wrap justify-end">
                    {c.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'var(--color-pomor-green-soft)', color: 'var(--color-pomor-green-dk)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs shrink-0 hidden md:block" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDate(c.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
