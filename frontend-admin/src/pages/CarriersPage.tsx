import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as carriersApi from '../api/carriers'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import type { Carrier, CarrierRequest } from '../types'

const emptyForm: CarrierRequest = {
  name: '',
  mcNumber: '',
  dotNumber: '',
  phone: '',
  email: '',
}

export function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Carrier | null>(null)
  const [form, setForm] = useState<CarrierRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadCarriers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await carriersApi.getCarriers(page)
      setCarriers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load carriers')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadCarriers()
  }, [loadCarriers])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(carrier: Carrier) {
    setEditing(carrier)
    setForm({
      name: carrier.name,
      mcNumber: carrier.mcNumber,
      dotNumber: carrier.dotNumber,
      phone: carrier.phone,
      email: carrier.email,
    })
    setModalOpen(true)
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
      setModalOpen(false)
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
      await loadCarriers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete carrier')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Carriers</h1>
          <p className="text-sm text-slate-400">Manage motor carriers and compliance details.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Add carrier
        </button>
      </div>

      {error && <Alert message={error} />}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">MC #</th>
                <th className="px-4 py-3 font-medium">DOT #</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading carriers...
                  </td>
                </tr>
              ) : carriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No carriers yet. Add your first carrier to get started.
                  </td>
                </tr>
              ) : (
                carriers.map((carrier) => (
                  <tr key={carrier.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-white">{carrier.name}</td>
                    <td className="px-4 py-3 text-slate-300">{carrier.mcNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{carrier.dotNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{carrier.phone}</td>
                    <td className="px-4 py-3 text-slate-300">{carrier.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(carrier)}
                          className="text-brand-300 hover:text-brand-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(carrier)}
                          className="text-rose-400 hover:text-rose-300"
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
        <div className="border-t border-white/10 px-4 py-3">
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="Name">
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
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
