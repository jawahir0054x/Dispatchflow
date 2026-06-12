import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  href?: string
  variant?: 'gradient' | 'light'
  color?: string
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  href,
  variant = 'gradient',
  color = 'from-brand-500 to-brand-700',
}: StatCardProps) {
  const content = (
    <div
      className={`flex min-h-[8.5rem] flex-col justify-between rounded-2xl p-6 shadow-lg transition hover:shadow-xl ${
        variant === 'gradient'
          ? `bg-gradient-to-br ${color} text-white`
          : 'border border-surface-200 bg-white text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-sm font-medium ${
            variant === 'gradient' ? 'text-white/80' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        <div
          className={`rounded-xl p-2.5 ${
            variant === 'gradient' ? 'bg-white/15' : 'bg-surface-100 text-brand-600'
          }`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p
            className={`mt-1.5 text-xs ${
              variant === 'gradient' ? 'text-white/70' : 'text-slate-400'
            }`}
          >
            {subtitle}
          </p>
        )}
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
