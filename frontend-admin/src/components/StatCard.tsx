import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  href?: string
  accent?: string
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  href,
  accent = 'from-brand-600/30 to-brand-900/20',
}: StatCardProps) {
  const content = (
    <div
      className={`flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-6 transition hover:border-white/20`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <div className="rounded-xl bg-white/10 p-2.5 text-brand-300">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
