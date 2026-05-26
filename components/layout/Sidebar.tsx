'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, BookOpen, MapPin,
  Users, UserCheck, ReceiptText, TrendingUp, Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  {
    label: 'Главное',
    items: [
      { href: '/dashboard',   icon: LayoutDashboard, label: 'Дашборд' },
      { href: '/calendar',    icon: CalendarDays,    label: 'Календарь' },
      { href: '/bookings',    icon: BookOpen,         label: 'Бронирования' },
    ],
  },
  {
    label: 'Объект',
    items: [
      { href: '/locations',   icon: MapPin,     label: 'Пространства' },
      { href: '/clients',     icon: Users,       label: 'Клиенты' },
      { href: '/staff',       icon: UserCheck,   label: 'Персонал' },
    ],
  },
  {
    label: 'Финансы',
    items: [
      { href: '/finance',     icon: ReceiptText,  label: 'Финансы' },
      { href: '/analytics',   icon: TrendingUp,   label: 'Аналитика' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--color-pomor-green-dk)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <PineLogo />
        <div>
          <p className="text-white text-sm font-bold leading-none tracking-wide">Усадьба</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(240,232,213,0.45)' }}>
            Venue OS
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(240,232,213,0.3)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link key={href} href={href} className={cn('nav-link', active && 'active')}>
                    <Icon size={15} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/settings" className={cn('nav-link', pathname.startsWith('/settings') && 'active')}>
          <Settings size={15} className="shrink-0" />
          <span>Настройки</span>
        </Link>
        <div className="mt-3 px-3 py-2.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-xs font-medium text-white/70">Усадьба OS</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,232,213,0.35)' }}>v1.0.0 · Поморцы</p>
        </div>
      </div>
    </aside>
  )
}

function PineLogo() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 shrink-0">
      <circle cx="18" cy="18" r="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <polygon points="18,6 25,16 11,16" fill="white" />
      <polygon points="18,11 27,23 9,23" fill="white" />
      <polygon points="18,17 29,32 7,32" fill="white" />
      <rect x="16" y="32" width="4" height="3" rx="0.5" fill="white" />
    </svg>
  )
}
