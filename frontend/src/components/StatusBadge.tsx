import type { LoadStatus } from '../types'
import { formatEnum } from '../utils/format'

const statusStyles: Record<LoadStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
}

interface StatusBadgeProps {
  status: LoadStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {formatEnum(status)}
    </span>
  )
}
