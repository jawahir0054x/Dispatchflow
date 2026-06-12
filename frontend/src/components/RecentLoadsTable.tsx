import { Link } from 'react-router-dom'
import type { Load } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import { DispatchActions } from './DispatchActions'
import { StatusBadge } from './StatusBadge'

interface RecentLoadsTableProps {
  loads: Load[]
  onLoadUpdated: (load: Load) => void
  onError: (message: string) => void
  showDispatchActions?: boolean
}

export function RecentLoadsTable({
  loads,
  onLoadUpdated,
  onError,
  showDispatchActions = true,
}: RecentLoadsTableProps) {
  if (loads.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No loads yet.{' '}
        <Link to="/loads" className="font-medium text-brand-600 hover:text-brand-700">
          Create your first load
        </Link>
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-surface-200 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Load #</th>
            <th className="px-4 py-3 font-medium">Lane</th>
            <th className="px-4 py-3 font-medium">Driver</th>
            <th className="px-4 py-3 font-medium">Rate</th>
            <th className="px-4 py-3 font-medium">RPM</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {showDispatchActions && <th className="px-4 py-3 font-medium">Dispatch</th>}
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {loads.map((load) => (
            <tr key={load.id} className="border-b border-surface-100 last:border-0">
              <td className="px-4 py-3">
                <p className="font-mono text-xs font-semibold text-brand-700">{load.loadNumber}</p>
                <p className="text-slate-600">{load.brokerName}</p>
              </td>
              <td className="px-4 py-3">
                {load.pickupCity} → {load.deliveryCity}
              </td>
              <td className="px-4 py-3">
                <p>{load.driverName}</p>
                <p className="text-xs text-slate-400">{load.carrierName}</p>
              </td>
              <td className="px-4 py-3 font-medium">{formatCurrency(load.rate)}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatCurrency(load.ratePerMile)}/mi
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={load.status} />
              </td>
              {showDispatchActions && (
                <td className="px-4 py-3">
                  <DispatchActions
                    load={load}
                    onUpdated={onLoadUpdated}
                    onError={onError}
                    compact
                  />
                </td>
              )}
              <td className="px-4 py-3 text-xs text-slate-400">{formatDate(load.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
