import type { LoadStatus } from '../types'
import { formatEnum } from '../utils/format'

const STATUS_COLORS: Record<LoadStatus, string> = {
  PENDING: 'bg-amber-500',
  DISPATCHED: 'bg-blue-500',
  IN_TRANSIT: 'bg-indigo-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-400',
}

const STATUS_ORDER: LoadStatus[] = [
  'PENDING',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]

interface LoadStatusChartProps {
  loadsByStatus: Record<LoadStatus, number>
}

export function LoadStatusChart({ loadsByStatus }: LoadStatusChartProps) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + (loadsByStatus[status] ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
        {STATUS_ORDER.map((status) => {
          const count = loadsByStatus[status] ?? 0
          if (count === 0 || total === 0) return null
          return (
            <div
              key={status}
              className={`${STATUS_COLORS[status]} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          )
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {STATUS_ORDER.map((status) => {
          const count = loadsByStatus[status] ?? 0
          return (
            <div key={status} className="flex items-center gap-2 text-sm">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-slate-400">{formatEnum(status)}</span>
              <span className="ml-auto font-semibold text-white">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
