import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, TextInput } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@dispatchflow.com')
  const [password, setPassword] = useState('admin12345')
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<string[] | undefined>()
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setDetails(undefined)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
        setDetails(err.details)
      } else {
        setError('Unable to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            DispatchFlow AI
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in to dispatch</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage carriers, drivers, and loads from one place.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert message={error} details={details} />}

          <FormField label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Register as dispatcher
          </Link>
        </p>
      </div>
    </div>
  )
}
