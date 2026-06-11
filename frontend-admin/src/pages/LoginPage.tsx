import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, TextInput } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@dispatchflow.com')
  const [password, setPassword] = useState('admin12345')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">
            DispatchFlow Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Administrator sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage users, carriers, drivers, and system-wide settings.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert message={error} />}

          <FormField label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-white/10 bg-surface-950 text-white"
            />
          </FormField>

          <FormField label="Password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-white/10 bg-surface-950 text-white"
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in to admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
