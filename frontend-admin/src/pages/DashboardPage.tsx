import { useEffect, useState } from 'react'
import * as carriersApi from '../api/carriers'
import * as driversApi from '../api/drivers'
import * as loadsApi from '../api/loads'
import * as usersApi from '../api/users'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { useAuth } from '../context/AuthContext'

interface Stats {
  users: number
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
        const [users, carriers, drivers, loads] = await Promise.all([
          usersApi.getUsers(0, 1),
          carriersApi.getCarriers(0, 1),
          driversApi.getDrivers(0, 1),
          loadsApi.getLoads(0, 1),
        ])
        setStats({
          users: users.totalElements,
          carriers: carriers.totalElements,
          drivers: drivers.totalElements,
          loads: loads.totalElements,
        })
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load overview')
      }
    }

    loadStats()
  }, [])

  const cards = [
    { label: 'Users', value: stats?.users ?? '—' },
    { label: 'Carriers', value: stats?.carriers ?? '—' },
    { label: 'Drivers', value: stats?.drivers ?? '—' },
    { label: 'Loads', value: stats?.loads ?? '—' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin overview</h1>
        <p className="mt-1 text-slate-400">
          Welcome, {user?.firstName}. System-wide metrics and management tools.
        </p>
      </div>

      {error && <Alert message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-surface-900 p-5"
          >
            <p className="text-sm font-medium text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
