import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as driversApi from '../api/drivers'
import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { DeadheadCalculator } from '../components/DeadheadCalculator'
import { DispatchActions } from '../components/DispatchActions'
import { LoadAnalyzerCard } from '../components/LoadAnalyzerCard'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import type { Driver, Load, LoadRequest, LoadStatus } from '../types'
import { formatCurrency, formatDate, formatDateOnly, formatEnum, formatPercent } from '../utils/format'

const LOAD_STATUSES: LoadStatus[] = [
  'AVAILABLE',
  'BOOKED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'PAID',
]

const emptyForm: LoadRequest = {
  driverId: null,
  referenceNumber: '',
  brokerName: '',
  pickupCity: '',
  deliveryCity: '',
  commodity: '',
  rate: 0,
  miles: 0,
  deadheadMiles: 0,
  pickupDate: '',
  deliveryDate: '',
  status: 'AVAILABLE',
}

function loadToForm(load: Load): LoadRequest {
  return {
    driverId: load.driverId ?? null,
    referenceNumber: load.referenceNumber ?? '',
    brokerName: load.brokerName,
    pickupCity: load.pickupCity,
    deliveryCity: load.deliveryCity,
    commodity: load.commodity,
    rate: load.rate,
    miles: load.miles,
    deadheadMiles: load.deadheadMiles,
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
    status: load.status,
  }
}

function toLoadPayload(form: LoadRequest): LoadRequest {
  return {
    ...form,
    driverId: form.driverId || null,
    referenceNumber: form.referenceNumber?.trim() || undefined,
    deadheadMiles: form.deadheadMiles ?? 0,
  }
}

export function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driverFilter, setDriverFilter] = useState<number | undefined>()
  const [statusFilter, setStatusFilter] = useState<LoadStatus | undefined>()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Load | null>(null)
  const [viewing, setViewing] = useState<Load | null>(null)
  const [form, setForm] = useState<LoadRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadLoads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await loadsApi.getLoads(
        page,
        20,
        'createdAt,desc',
        driverFilter,
        statusFilter,
        search,
      )
      setLoads(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load loads')
    } finally {
      setLoading(false)
    }
  }, [page, driverFilter, statusFilter, search])

  useEffect(() => {
    driversApi.getDrivers(0, 100).then((res) => setDrivers(res.content)).catch(() => {})
  }, [])

  useEffect(() => {
    loadLoads()
  }, [loadLoads])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormModalOpen(true)
  }

  function openEdit(load: Load) {
    setEditing(load)
    setForm(loadToForm(load))
    setDetailsModalOpen(false)
    setFormModalOpen(true)
  }

  async function openView(load: Load) {
    setError(null)
    try {
      const details = await loadsApi.getLoad(load.id)
      setViewing(details)
      setDetailsModalOpen(true)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load load details')
    }
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = toLoadPayload(form)
      if (editing) {
        await loadsApi.updateLoad(editing.id, payload)
      } else {
        await loadsApi.createLoad(payload)
      }
      setFormModalOpen(false)
      await loadLoads()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save load')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLoadUpdated(updated: Load) {
    setLoads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    setViewing((prev) => (prev?.id === updated.id ? updated : prev))
  }

  async function handleDelete(load: Load) {
    if (!confirm(`Delete load for ${load.brokerName}?`)) {
      return
    }
    setError(null)
    try {
      await loadsApi.deleteLoad(load.id)
      setDetailsModalOpen(false)
      setViewing(null)
      await loadLoads()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete load')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loads</h1>
          <p className="text-sm text-slate-500">Assign freight and track delivery status.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add load
        </button>
      </div>

      {error && <Alert message={error} />}

      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap gap-3">
          <TextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by broker, lane, commodity, driver, or carrier..."
            className="min-w-64 flex-1"
          />
          <button
            type="submit"
            className="rounded-xl bg-surface-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface-200"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-slate-600"
            >
              Clear
            </button>
          )}
        </form>
        <FormField label="Filter by driver">
          <SelectInput
            value={driverFilter ?? ''}
            onChange={(e) => {
              setPage(0)
              setDriverFilter(e.target.value ? Number(e.target.value) : undefined)
            }}
            className="min-w-48"
          >
            <option value="">All drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
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
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Load #</th>
                <th className="px-4 py-3 font-medium">Lane</th>
                <th className="px-4 py-3 font-medium">Driver / Carrier</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">RPM</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dispatch</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading loads...
                  </td>
                </tr>
              ) : loads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    {search || driverFilter || statusFilter
                      ? 'No loads match your filters.'
                      : 'No loads yet. Add your first load to get started.'}
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-brand-700">{load.loadNumber}</p>
                      <p className="font-medium text-slate-900">{load.brokerName}</p>
                      {load.referenceNumber && (
                        <p className="text-xs text-slate-400">Ref: {load.referenceNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {load.pickupCity} → {load.deliveryCity}
                      <p className="text-xs text-slate-400">{load.miles} mi · {load.commodity}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{load.driverName ?? 'Unassigned'}</p>
                      {load.carrierName && (
                        <p className="text-xs text-slate-400">{load.carrierName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(load.rate)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(load.ratePerMile)}/mi
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={load.status} />
                    </td>
                    <td className="px-4 py-3">
                      <DispatchActions
                        load={load}
                        onUpdated={handleLoadUpdated}
                        onError={setError}
                        compact
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openView(load)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(load)}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(load)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
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

      <Modal
        title={editing ? 'Edit load' : 'Add load'}
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Assigned driver">
            <SelectInput
              value={form.driverId ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverId: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">Unassigned</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.carrierName})
                </option>
              ))}
            </SelectInput>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Broker name">
              <TextInput
                value={form.brokerName}
                onChange={(e) => setForm({ ...form, brokerName: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Reference # (optional)">
              <TextInput
                value={form.referenceNumber ?? ''}
                onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                placeholder="Broker load ID"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Pickup city">
              <TextInput
                value={form.pickupCity}
                onChange={(e) => setForm({ ...form, pickupCity: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Delivery city">
              <TextInput
                value={form.deliveryCity}
                onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                required
              />
            </FormField>
          </div>
          <DeadheadCalculator
            drivers={drivers}
            selectedDriverId={form.driverId ?? null}
            pickupCity={form.pickupCity}
            onApply={(deadheadMiles) => setForm({ ...form, deadheadMiles })}
          />
          <FormField label="Commodity">
            <TextInput
              value={form.commodity}
              onChange={(e) => setForm({ ...form, commodity: e.target.value })}
              required
            />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Rate ($)">
              <TextInput
                type="number"
                min="0.01"
                step="0.01"
                value={form.rate || ''}
                onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                required
              />
            </FormField>
            <FormField label="Loaded miles">
              <TextInput
                type="number"
                min="1"
                value={form.miles || ''}
                onChange={(e) => setForm({ ...form, miles: Number(e.target.value) })}
                required
              />
            </FormField>
            <FormField label="Deadhead miles">
              <TextInput
                type="number"
                min="0"
                value={form.deadheadMiles ?? 0}
                onChange={(e) => setForm({ ...form, deadheadMiles: Number(e.target.value) })}
              />
            </FormField>
          </div>
          <LoadAnalyzerCard
            rate={form.rate}
            miles={form.miles}
            deadheadMiles={form.deadheadMiles ?? 0}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Pickup date">
              <TextInput
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Delivery date">
              <TextInput
                type="date"
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                required
              />
            </FormField>
          </div>
          <FormField label="Status">
            <SelectInput
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LoadStatus })}
              required
            >
              {LOAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnum(status)}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add load'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Load details"
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false)
          setViewing(null)
        }}
      >
        {viewing && (
          <div className="space-y-4">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Load number</dt>
                <dd className="font-mono font-medium text-brand-700">{viewing.loadNumber}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Broker</dt>
                  <dd className="font-medium text-slate-900">{viewing.brokerName}</dd>
                </div>
                {viewing.referenceNumber && (
                  <div>
                    <dt className="text-slate-500">Reference #</dt>
                    <dd className="font-medium text-slate-900">{viewing.referenceNumber}</dd>
                  </div>
                )}
              </div>
              <div>
                <dt className="text-slate-500">Lane</dt>
                <dd className="font-medium text-slate-900">
                  {viewing.pickupCity} → {viewing.deliveryCity}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Commodity</dt>
                <dd className="font-medium text-slate-900">{viewing.commodity}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Loaded miles</dt>
                  <dd className="font-medium text-slate-900">{viewing.miles}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Deadhead miles</dt>
                  <dd className="font-medium text-slate-900">{viewing.deadheadMiles}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-500">Rate</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(viewing.rate)}</dd>
              </div>
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Profitability
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <dt className="text-slate-500">Rate per mile</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCurrency(viewing.ratePerMile)}/mi
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Deadhead %</dt>
                    <dd className="font-medium text-slate-900">
                      {formatPercent(viewing.deadheadPercentage)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Estimated profit</dt>
                    <dd
                      className={`font-medium ${
                        viewing.estimatedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(viewing.estimatedProfit)}
                    </dd>
                  </div>
                </div>
              </div>
              <LoadAnalyzerCard
                rate={viewing.rate}
                miles={viewing.miles}
                deadheadMiles={viewing.deadheadMiles}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Pickup date</dt>
                  <dd className="font-medium text-slate-900">{formatDateOnly(viewing.pickupDate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Delivery date</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateOnly(viewing.deliveryDate)}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-500">Assigned driver</dt>
                <dd className="font-medium text-slate-900">
                  {viewing.driverName ?? 'Unassigned'}
                  {viewing.carrierName && (
                    <span className="block text-xs font-normal text-slate-500">
                      {viewing.carrierName}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={viewing.status} />
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-surface-100 pt-3">
                <div>
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-slate-700">{formatDate(viewing.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="text-slate-700">{formatDate(viewing.updatedAt)}</dd>
                </div>
              </div>
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <DispatchActions load={viewing} onUpdated={handleLoadUpdated} onError={setError} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(viewing)}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Edit load
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(viewing)}
                  className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
