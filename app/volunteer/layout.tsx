export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-pomor-parch)' }}>
      <header className="border-b" style={{ borderColor: 'var(--color-pomor-parch-dk)', background: 'var(--color-pomor-green-dk)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 shrink-0">
            <circle cx="18" cy="18" r="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
            <polygon points="18,6 25,16 11,16" fill="white" />
            <polygon points="18,11 27,23 9,23" fill="white" />
            <polygon points="18,17 29,32 7,32" fill="white" />
            <rect x="16" y="32" width="4" height="3" rx="0.5" fill="white" />
          </svg>
          <div>
            <p className="text-white text-sm font-bold leading-none">Усадьба — волонтёрство</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,232,213,0.5)' }}>Запись на работы</p>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
