import type { DriverStatus } from '../types'
import { formatEnum } from '../utils/format'

const statusStyles: Record<DriverStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  UNDER_LOAD: 'bg-blue-100 text-blue-800',
  OFF_DUTY: 'bg-slate-200 text-slate-700',
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
