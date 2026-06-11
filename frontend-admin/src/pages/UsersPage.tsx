import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as usersApi from '../api/users'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import type { Role, UserRecord, UserRequest } from '../types'
import { formatDate } from '../utils/format'

const ROLES: Role[] = ['ADMIN', 'DISPATCHER']

const emptyForm: UserRequest = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'DISPATCHER',
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [form, setForm] = useState<UserRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersApi.getUsers(page)
      setUsers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(user: UserRecord) {
    setEditing(user)
    setForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = { ...form }
      if (editing && !payload.password) {
        delete payload.password
      }
      if (editing) {
        await usersApi.updateUser(editing.id, payload)
      } else {
        await usersApi.createUser(payload as UserRequest & { password: string })
      }
      setModalOpen(false)
      await loadUsers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(user: UserRecord) {
    if (!confirm(`Delete user "${user.email}"?`)) {
      return
    }
    setError(null)
    try {
      await usersApi.deleteUser(user.id)
      await loadUsers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete user')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-slate-400">Manage admin and dispatcher accounts.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Add user
        </button>
      </div>

      {error && <Alert message={error} />}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-900/50 px-2.5 py-1 text-xs font-semibold text-brand-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="text-brand-300 hover:text-brand-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
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
        title={editing ? 'Edit user' : 'Add user'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name">
              <TextInput
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Last name">
              <TextInput
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </FormField>
          </div>
          <FormField label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </FormField>
          <FormField label={editing ? 'New password (optional)' : 'Password'}>
            <TextInput
              type="password"
              value={form.password ?? ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
              minLength={8}
            />
          </FormField>
          <FormField label="Role">
            <SelectInput
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              required
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectInput>
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
