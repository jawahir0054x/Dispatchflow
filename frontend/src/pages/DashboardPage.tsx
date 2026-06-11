import { useEffect, useState } from 'react'
import * as carriersApi from '../api/carriers'
import * as driversApi from '../api/drivers'
import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { useAuth } from '../context/AuthContext'

interface Stats {
  carriers: number
  drivers: number
  loads: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const [carriers, drivers, loads] = await Promise.all([
          carriersApi.getCarriers(0, 1),
          driversApi.getDrivers(0, 1),
          loadsApi.getLoads(0, 1),
        ])
        setStats({
          carriers: carriers.totalElements,
          drivers: drivers.totalElements,
          loads: loads.totalElements,
        })
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard')
      }
    }

    loadStats()
  }, [])

  const cards = [
    { label: 'Carriers', value: stats?.carriers ?? '—', color: 'from-brand-500 to-brand-700' },
    { label: 'Drivers', value: stats?.drivers ?? '—', color: 'from-indigo-500 to-indigo-700' },
    { label: 'Loads', value: stats?.loads ?? '—', color: 'from-emerald-500 to-emerald-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-slate-500">
          Your logistics command center for carriers, drivers, and active loads.
        </p>
      </div>

      {error && <Alert message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-5 text-white shadow-lg`}
          >
            <p className="text-sm font-medium text-white/80">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick start</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Add carriers with MC and DOT numbers.</li>
          <li>Assign drivers to each carrier with truck and trailer details.</li>
          <li>Create loads and track status from pending through delivered.</li>
        </ol>
      </div>
    </div>
  )
}
