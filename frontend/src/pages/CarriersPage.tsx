import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as carriersApi from '../api/carriers'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { useAuth } from '../context/AuthContext'
import type { Carrier, CarrierRequest } from '../types'
import { formatDate, formatDateOnly } from '../utils/format'

const emptyForm: CarrierRequest = {
  name: '',
  mcNumber: '',
  dotNumber: '',
  phone: '',
  email: '',
  insuranceExpiryDate: '',
}

function carrierToForm(carrier: Carrier): CarrierRequest {
  return {
    name: carrier.name,
    mcNumber: carrier.mcNumber,
    dotNumber: carrier.dotNumber,
    phone: carrier.phone,
    email: carrier.email,
    insuranceExpiryDate: carrier.insuranceExpiryDate,
  }
}

function isInsuranceExpired(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = date.split('-').map(Number)
  const expiry = new Date(year, month - 1, day)
  return expiry < today
}

export function CarriersPage() {
  const { isAdmin } = useAuth()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Carrier | null>(null)
  const [viewing, setViewing] = useState<Carrier | null>(null)
  const [form, setForm] = useState<CarrierRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadCarriers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await carriersApi.getCarriers(page, 20, 'name,asc', search)
      setCarriers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load carriers')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    loadCarriers()
  }, [loadCarriers])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormModalOpen(true)
  }

  function openEdit(carrier: Carrier) {
    setEditing(carrier)
    setForm(carrierToForm(carrier))
    setDetailsModalOpen(false)
    setFormModalOpen(true)
  }

  async function openView(carrier: Carrier) {
    setError(null)
    try {
      const details = await carriersApi.getCarrier(carrier.id)
      setViewing(details)
      setDetailsModalOpen(true)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load carrier details')
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
        await carriersApi.updateCarrier(editing.id, form)
      } else {
        await carriersApi.createCarrier(form)
      }
      setFormModalOpen(false)
      await loadCarriers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save carrier')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(carrier: Carrier) {
    if (!confirm(`Delete carrier "${carrier.name}"?`)) {
      return
    }
    setError(null)
    try {
      await carriersApi.deleteCarrier(carrier.id)
      setDetailsModalOpen(false)
      setViewing(null)
      await loadCarriers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete carrier')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carriers</h1>
          <p className="text-sm text-slate-500">Manage motor carriers and compliance details.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add carrier
        </button>
      </div>

      {error && <Alert message={error} />}

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
        <TextInput
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, MC, DOT, phone, or email..."
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

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Carrier name</th>
                <th className="px-4 py-3 font-medium">MC #</th>
                <th className="px-4 py-3 font-medium">DOT #</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Insurance expiry</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading carriers...
                  </td>
                </tr>
              ) : carriers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {search
                      ? 'No carriers match your search.'
                      : 'No carriers yet. Add your first carrier to get started.'}
                  </td>
                </tr>
              ) : (
                carriers.map((carrier) => (
                  <tr key={carrier.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{carrier.name}</td>
                    <td className="px-4 py-3">{carrier.mcNumber}</td>
                    <td className="px-4 py-3">{carrier.dotNumber}</td>
                    <td className="px-4 py-3">{carrier.phone}</td>
                    <td className="px-4 py-3">{carrier.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isInsuranceExpired(carrier.insuranceExpiryDate)
                            ? 'font-medium text-rose-600'
                            : 'text-slate-700'
                        }
                      >
                        {formatDateOnly(carrier.insuranceExpiryDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openView(carrier)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(carrier)}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(carrier)}
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
        title={editing ? 'Edit carrier' : 'Add carrier'}
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Carrier name">
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="MC number">
              <TextInput
                value={form.mcNumber}
                onChange={(e) => setForm({ ...form, mcNumber: e.target.value })}
                required
              />
            </FormField>
            <FormField label="DOT number">
              <TextInput
                value={form.dotNumber}
                onChange={(e) => setForm({ ...form, dotNumber: e.target.value })}
                required
              />
            </FormField>
          </div>
          <FormField label="Phone">
            <TextInput
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Insurance expiry date">
            <TextInput
              type="date"
              value={form.insuranceExpiryDate}
              onChange={(e) => setForm({ ...form, insuranceExpiryDate: e.target.value })}
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
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add carrier'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Carrier details"
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
                <dt className="text-slate-500">Carrier name</dt>
                <dd className="font-medium text-slate-900">{viewing.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-slate-500">MC number</dt>
                  <dd className="font-medium text-slate-900">{viewing.mcNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">DOT number</dt>
                  <dd className="font-medium text-slate-900">{viewing.dotNumber}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-900">{viewing.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{viewing.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Insurance expiry date</dt>
                <dd
                  className={`font-medium ${
                    isInsuranceExpired(viewing.insuranceExpiryDate)
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}
                >
                  {formatDateOnly(viewing.insuranceExpiryDate)}
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
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => openEdit(viewing)}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Edit carrier
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
