import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import type { Load, LoadStatus } from '../types'

const NEXT_STATUS: Partial<Record<LoadStatus, { status: LoadStatus; label: string }>> = {
  PENDING: { status: 'DISPATCHED', label: 'Dispatch' },
  DISPATCHED: { status: 'IN_TRANSIT', label: 'In transit' },
  IN_TRANSIT: { status: 'DELIVERED', label: 'Delivered' },
}

interface DispatchActionsProps {
  load: Load
  onUpdated: (load: Load) => void
  onError: (message: string) => void
  compact?: boolean
}

export function DispatchActions({ load, onUpdated, onError, compact }: DispatchActionsProps) {
  const next = NEXT_STATUS[load.status]

  async function advanceStatus() {
    if (!next) return
    try {
      const updated = await loadsApi.updateLoadStatus(load.id, next.status)
      onUpdated(updated)
    } catch (err) {
      onError(err instanceof ApiClientError ? err.message : 'Failed to update status')
    }
  }

  if (!next) {
    return <span className="text-xs text-slate-400">—</span>
  }

  return (
    <button
      type="button"
      onClick={advanceStatus}
      className={`rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700 ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      {next.label}
    </button>
  )
}
