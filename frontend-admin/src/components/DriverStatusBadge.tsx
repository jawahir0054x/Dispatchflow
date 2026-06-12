import type { DriverStatus } from '../types'
import { formatEnum } from '../utils/format'

const statusStyles: Record<DriverStatus, string> = {
  AVAILABLE: 'bg-emerald-500/20 text-emerald-300',
  UNDER_LOAD: 'bg-blue-500/20 text-blue-300',
  OFF_DUTY: 'bg-white/10 text-slate-400',
}

interface DriverStatusBadgeProps {
  status: DriverStatus
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {formatEnum(status)}
    </span>
  )
}
