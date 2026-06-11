import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as driversApi from '../api/drivers'
import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import type { Driver, Load, LoadRequest, LoadStatus } from '../types'
import { formatCurrency } from '../utils/format'

const LOAD_STATUSES: LoadStatus[] = [
  'PENDING',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]

const emptyForm: LoadRequest = {
  driverId: 0,
  brokerName: '',
  pickupCity: '',
  deliveryCity: '',
  rate: 0,
  miles: 0,
  status: 'PENDING',
}

export function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driverFilter, setDriverFilter] = useState<number | undefined>()
  const [statusFilter, setStatusFilter] = useState<LoadStatus | undefined>()
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Load | null>(null)
  const [form, setForm] = useState<LoadRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadLoads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await loadsApi.getLoads(page, 20, 'createdAt,desc', driverFilter, statusFilter)
      setLoads(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load loads')
    } finally {
      setLoading(false)
    }
  }, [page, driverFilter, statusFilter])

  useEffect(() => {
    driversApi.getDrivers(0, 100).then((res) => setDrivers(res.content)).catch(() => {})
  }, [])

  useEffect(() => {
    loadLoads()
  }, [loadLoads])

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      driverId: drivers[0]?.id ?? 0,
    })
    setModalOpen(true)
  }

  function openEdit(load: Load) {
    setEditing(load)
    setForm({
      driverId: load.driverId,
      brokerName: load.brokerName,
      pickupCity: load.pickupCity,
      deliveryCity: load.deliveryCity,
      rate: load.rate,
      miles: load.miles,
      status: load.status,
    })
    setModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (editing) {
        await loadsApi.updateLoad(editing.id, form)
      } else {
        await loadsApi.createLoad(form)
      }
      setModalOpen(false)
      await loadLoads()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save load')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(load: Load) {
    if (!confirm(`Delete load for ${load.brokerName}?`)) {
      return
    }
    setError(null)
    try {
      await loadsApi.deleteLoad(load.id)
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
          disabled={drivers.length === 0}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add load
        </button>
      </div>

      {drivers.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add a driver before creating loads.
        </div>
      )}

      {error && <Alert message={error} />}

      <div className="flex flex-wrap gap-4">
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
                {status.replaceAll('_', ' ')}
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
                <th className="px-4 py-3 font-medium">Broker</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Miles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading loads...
                  </td>
                </tr>
              ) : loads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No loads found.
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{load.brokerName}</td>
                    <td className="px-4 py-3">
                      {load.pickupCity} → {load.deliveryCity}
                    </td>
                    <td className="px-4 py-3">{load.driverName}</td>
                    <td className="px-4 py-3">{formatCurrency(load.rate)}</td>
                    <td className="px-4 py-3">{load.miles}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={load.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Driver">
            <SelectInput
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: Number(e.target.value) })}
              required
            >
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.carrierName})
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Broker name">
            <TextInput
              value={form.brokerName}
              onChange={(e) => setForm({ ...form, brokerName: e.target.value })}
              required
            />
          </FormField>
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
          <div className="grid grid-cols-2 gap-4">
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
            <FormField label="Miles">
              <TextInput
                type="number"
                min="1"
                value={form.miles || ''}
                onChange={(e) => setForm({ ...form, miles: Number(e.target.value) })}
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
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
