import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import type { Load, LoadStatus } from '../types'
import { formatCurrency, formatDateOnly, formatEnum } from '../utils/format'

const LOAD_STATUSES: LoadStatus[] = [
  'AVAILABLE',
  'BOOKED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'PAID',
]

type PickupSort = 'pickupDate,asc' | 'pickupDate,desc'

export function DispatchBoardPage() {
  const [loads, setLoads] = useState<Load[]>([])
  const [statusFilter, setStatusFilter] = useState<LoadStatus | undefined>()
  const [brokerSearch, setBrokerSearch] = useState('')
  const [driverSearch, setDriverSearch] = useState('')
  const [brokerInput, setBrokerInput] = useState('')
  const [driverInput, setDriverInput] = useState('')
  const [pickupSort, setPickupSort] = useState<PickupSort>('pickupDate,asc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBoard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await loadsApi.getLoads(
        page,
        20,
        pickupSort,
        undefined,
        statusFilter,
        undefined,
        brokerSearch,
        driverSearch,
      )
      setLoads(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load dispatch board')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, brokerSearch, driverSearch, pickupSort])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setPage(0)
    setBrokerSearch(brokerInput.trim())
    setDriverSearch(driverInput.trim())
  }

  function clearFilters() {
    setBrokerInput('')
    setDriverInput('')
    setBrokerSearch('')
    setDriverSearch('')
    setStatusFilter(undefined)
    setPage(0)
  }

  const hasFilters = Boolean(statusFilter || brokerSearch || driverSearch)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dispatch Board</h1>
        <p className="text-sm text-slate-500">
          Live load board — filter, search, and sort by pickup date.
        </p>
      </div>

      {error && <Alert message={error} />}

      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap gap-3">
          <TextInput
            value={brokerInput}
            onChange={(e) => setBrokerInput(e.target.value)}
            placeholder="Search by broker..."
            className="min-w-48 flex-1"
          />
          <TextInput
            value={driverInput}
            onChange={(e) => setDriverInput(e.target.value)}
            placeholder="Search by driver..."
            className="min-w-48 flex-1"
          />
          <button
            type="submit"
            className="rounded-xl bg-surface-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface-200"
          >
            Search
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-slate-600"
            >
              Clear
            </button>
          )}
        </form>
        <FormField label="Filter by status">
          <SelectInput
            value={statusFilter ?? ''}
            onChange={(e) => {
              setPage(0)
              setStatusFilter((e.target.value as LoadStatus) || undefined)
            }}
            className="min-w-48"
          >
            <option value="">All statuses</option>
            {LOAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatEnum(status)}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Sort by pickup date">
          <SelectInput
            value={pickupSort}
            onChange={(e) => {
              setPage(0)
              setPickupSort(e.target.value as PickupSort)
            }}
            className="min-w-52"
          >
            <option value="pickupDate,asc">Earliest first</option>
            <option value="pickupDate,desc">Latest first</option>
          </SelectInput>
        </FormField>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Load #</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Broker</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading dispatch board...
                  </td>
                </tr>
              ) : loads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {hasFilters
                      ? 'No loads match your filters.'
                      : 'No loads on the board yet.'}
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                      {load.loadNumber}
                    </td>
                    <td className="px-4 py-3">{load.driverName ?? 'Unassigned'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{load.brokerName}</td>
                    <td className="px-4 py-3">
                      <p>{load.pickupCity}</p>
                      <p className="text-xs text-slate-400">{formatDateOnly(load.pickupDate)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{load.deliveryCity}</p>
                      <p className="text-xs text-slate-400">{formatDateOnly(load.deliveryDate)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(load.rate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={load.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-surface-200 px-4 py-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
