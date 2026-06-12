import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as carriersApi from '../api/carriers'
import * as driversApi from '../api/drivers'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { DriverStatusBadge } from '../components/DriverStatusBadge'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { useAuth } from '../context/AuthContext'
import type { Carrier, Driver, DriverRequest, DriverStatus, TrailerType } from '../types'
import { formatDate, formatEnum } from '../utils/format'

const TRAILER_TYPES: TrailerType[] = [
  'DRY_VAN',
  'REEFER',
  'FLATBED',
  'STEP_DECK',
  'LOWBOY',
  'TANKER',
  'OTHER',
]

const DRIVER_STATUSES: DriverStatus[] = ['AVAILABLE', 'UNDER_LOAD', 'OFF_DUTY']

const emptyForm: DriverRequest = {
  carrierId: 0,
  name: '',
  phone: '',
  truckNumber: '',
  trailerType: 'DRY_VAN',
  currentLocation: '',
  status: 'AVAILABLE',
}

function driverToForm(driver: Driver): DriverRequest {
  return {
    carrierId: driver.carrierId,
    name: driver.name,
    phone: driver.phone,
    truckNumber: driver.truckNumber,
    trailerType: driver.trailerType,
    currentLocation: driver.currentLocation,
    status: driver.status,
  }
}

export function DriversPage() {
  const { isAdmin } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [carrierFilter, setCarrierFilter] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [viewing, setViewing] = useState<Driver | null>(null)
  const [form, setForm] = useState<DriverRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await driversApi.getDrivers(page, 20, 'name,asc', carrierFilter, search)
      setDrivers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }, [page, carrierFilter, search])

  useEffect(() => {
    carriersApi.getCarriers(0, 100).then((res) => setCarriers(res.content)).catch(() => {})
  }, [])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      carrierId: carriers[0]?.id ?? 0,
    })
    setFormModalOpen(true)
  }

  function openEdit(driver: Driver) {
    setEditing(driver)
    setForm(driverToForm(driver))
    setDetailsModalOpen(false)
    setFormModalOpen(true)
  }

  async function openView(driver: Driver) {
    setError(null)
    try {
      const details = await driversApi.getDriver(driver.id)
      setViewing(details)
      setDetailsModalOpen(true)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load driver details')
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
      if (editing) {
        await driversApi.updateDriver(editing.id, form)
      } else {
        await driversApi.createDriver(form)
      }
      setFormModalOpen(false)
      await loadDrivers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save driver')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(driver: Driver) {
    if (!confirm(`Delete driver "${driver.name}"?`)) {
      return
    }
    setError(null)
    try {
      await driversApi.deleteDriver(driver.id)
      setDetailsModalOpen(false)
      setViewing(null)
      await loadDrivers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete driver')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500">Track drivers, trucks, and fleet status.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={carriers.length === 0}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add driver
        </button>
      </div>

      {carriers.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add a carrier before creating drivers.
        </div>
      )}

      {error && <Alert message={error} />}

      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap gap-3">
          <TextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, truck, location, or carrier..."
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
        <FormField label="Filter by carrier">
          <SelectInput
            value={carrierFilter ?? ''}
            onChange={(e) => {
              setPage(0)
              setCarrierFilter(e.target.value ? Number(e.target.value) : undefined)
            }}
            className="min-w-48"
          >
            <option value="">All carriers</option>
            {carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.name}
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
                <th className="px-4 py-3 font-medium">Driver name</th>
                <th className="px-4 py-3 font-medium">Carrier</th>
                <th className="px-4 py-3 font-medium">Truck #</th>
                <th className="px-4 py-3 font-medium">Trailer</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    {search || carrierFilter
                      ? 'No drivers match your filters.'
                      : 'No drivers yet. Add your first driver to get started.'}
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{driver.name}</td>
                    <td className="px-4 py-3">{driver.carrierName}</td>
                    <td className="px-4 py-3">{driver.truckNumber}</td>
                    <td className="px-4 py-3">{formatEnum(driver.trailerType)}</td>
                    <td className="px-4 py-3">{driver.currentLocation}</td>
                    <td className="px-4 py-3">{driver.phone}</td>
                    <td className="px-4 py-3">
                      <DriverStatusBadge status={driver.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openView(driver)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(driver)}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(driver)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        )}
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
        title={editing ? 'Edit driver' : 'Add driver'}
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Carrier">
            <SelectInput
              value={form.carrierId}
              onChange={(e) => setForm({ ...form, carrierId: Number(e.target.value) })}
              required
            >
              {carriers.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Driver name">
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Truck number">
              <TextInput
                value={form.truckNumber}
                onChange={(e) => setForm({ ...form, truckNumber: e.target.value })}
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Trailer type">
              <SelectInput
                value={form.trailerType}
                onChange={(e) =>
                  setForm({ ...form, trailerType: e.target.value as TrailerType })
                }
                required
              >
                {TRAILER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatEnum(type)}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Status">
              <SelectInput
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as DriverStatus })
                }
                required
              >
                {DRIVER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatEnum(status)}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>
          <FormField label="Current location">
            <TextInput
              value={form.currentLocation}
              onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
              required
            />
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
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add driver'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Driver details"
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
                <dt className="text-slate-500">Driver name</dt>
                <dd className="font-medium text-slate-900">{viewing.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Carrier</dt>
                <dd className="font-medium text-slate-900">{viewing.carrierName}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-medium text-slate-900">{viewing.phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Truck number</dt>
                  <dd className="font-medium text-slate-900">{viewing.truckNumber}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">Trailer type</dt>
                  <dd className="font-medium text-slate-900">{formatEnum(viewing.trailerType)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className="mt-1">
                    <DriverStatusBadge status={viewing.status} />
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-500">Current location</dt>
                <dd className="font-medium text-slate-900">{viewing.currentLocation}</dd>
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
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => openEdit(viewing)}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Edit driver
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(viewing)}
                  className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
