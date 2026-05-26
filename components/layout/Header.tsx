'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, Plus, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Дашборд',
  '/calendar':   'Календарь',
  '/bookings':   'Бронирования',
  '/locations':  'Пространства',
  '/clients':    'Клиенты',
  '/staff':      'Персонал',
  '/finance':    'Финансы',
  '/analytics':  'Аналитика',
  '/settings':   'Настройки',
}

export function Header() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k + '/')) ?? ''] ?? 'Усадьба'

  return (
    <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Page title */}
      <h1 className="text-base font-semibold mr-auto" style={{ color: 'var(--color-text)' }}>
        {title}
      </h1>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={14} className="absolute left-3 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Поиск..."
          className="h-8 pl-9 pr-4 text-sm rounded-lg border outline-none w-52 focus:w-64 transition-all duration-200"
          style={{
            background: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)]"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Notifications */}
      <button className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-[var(--color-bg-subtle)] relative"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        <Bell size={15} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--color-pomor-red)' }} />
      </button>

      {/* New booking */}
      <Link href="/bookings/new"
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ background: 'var(--color-pomor-green)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-pomor-green-dk)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-pomor-green)')}>
        <Plus size={14} />
        <span className="hidden sm:inline">Бронирование</span>
      </Link>
    </header>
  )
}
