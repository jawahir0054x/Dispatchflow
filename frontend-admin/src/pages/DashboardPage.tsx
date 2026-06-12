import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as dashboardApi from '../api/dashboard'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import {
  ActivityIcon,
  BuildingIcon,
  ChartIcon,
  ClockIcon,
  DollarIcon,
  PackageIcon,
  RouteIcon,
  TruckIcon,
  UsersIcon,
} from '../components/Icons'
import { LoadStatusChart } from '../components/LoadStatusChart'
import { RecentLoadsTable } from '../components/RecentLoadsTable'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import type { DashboardStats, Load } from '../types'
import { formatCurrency } from '../utils/format'

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load overview')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  function handleLoadUpdated(updated: Load) {
    setStats((prev) => {
      if (!prev) return prev
      const updateList = (list: Load[]) =>
        list.map((load) => (load.id === updated.id ? updated : load))
      return {
        ...prev,
        recentLoads: updateList(prev.recentLoads),
        activeLoads: updateList(prev.activeLoads).filter(
          (l) => l.status === 'DISPATCHED' || l.status === 'IN_TRANSIT',
        ),
      }
    })
    loadStats()
  }

  const activeCount =
    (stats?.loadsByStatus.DISPATCHED ?? 0) + (stats?.loadsByStatus.IN_TRANSIT ?? 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin overview</h1>
          <p className="mt-1 text-slate-400">
            Welcome, {user?.firstName}. System-wide dispatch metrics and fleet performance.
          </p>
        </div>
        <Link
          to="/loads"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          + New load
        </Link>
      </div>

      {error && <Alert message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={loading ? '—' : formatCurrency(stats?.totalRevenue ?? 0)}
          subtitle={`${formatCurrency(stats?.pipelineRevenue ?? 0)} in pipeline`}
          icon={<DollarIcon className="h-5 w-5" />}
          accent="from-emerald-600/25 to-emerald-900/10"
        />
        <StatCard
          label="Active loads"
          value={loading ? '—' : activeCount}
          subtitle={`${stats?.loadsThisWeek ?? 0} new this week`}
          icon={<PackageIcon className="h-5 w-5" />}
          href="/loads"
          accent="from-brand-600/30 to-brand-900/15"
        />
        <StatCard
          label="Fleet drivers"
          value={loading ? '—' : (stats?.totalDrivers ?? 0)}
          subtitle={`${stats?.activeDrivers ?? 0} on load · ${stats?.idleDrivers ?? 0} available`}
          icon={<TruckIcon className="h-5 w-5" />}
          href="/drivers"
          accent="from-indigo-600/25 to-indigo-900/10"
        />
        <StatCard
          label="System users"
          value={loading ? '—' : (stats?.totalUsers ?? 0)}
          subtitle="Admins and dispatchers"
          icon={<UsersIcon className="h-5 w-5" />}
          href="/users"
          accent="from-violet-600/25 to-violet-900/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-surface-900 p-6 lg:col-span-1">
          <div className="mb-5 flex items-center gap-2">
            <ChartIcon className="h-5 w-5 text-brand-300" />
            <h2 className="text-lg font-semibold text-white">Load pipeline</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading metrics...</p>
          ) : stats ? (
            <LoadStatusChart loadsByStatus={stats.loadsByStatus} />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard
            label="Carriers"
            value={loading ? '—' : (stats?.totalCarriers ?? 0)}
            icon={<BuildingIcon className="h-5 w-5" />}
            href="/carriers"
          />
          <StatCard
            label="Avg rate / mile"
            value={loading ? '—' : formatCurrency(stats?.avgRatePerMile ?? 0)}
            subtitle={`${(stats?.totalMiles ?? 0).toLocaleString()} total miles`}
            icon={<RouteIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Delivered revenue"
            value={loading ? '—' : formatCurrency(stats?.deliveredRevenue ?? 0)}
            icon={<ActivityIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface-900">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-brand-300" />
            <h2 className="text-lg font-semibold text-white">Active dispatch board</h2>
          </div>
          <span className="rounded-full bg-brand-600/20 px-3 py-1 text-xs font-semibold text-brand-300">
            {stats?.activeLoads.length ?? 0} in motion
          </span>
        </div>
        <RecentLoadsTable
          loads={stats?.activeLoads ?? []}
          onLoadUpdated={handleLoadUpdated}
          onError={setError}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface-900">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-brand-300" />
            <h2 className="text-lg font-semibold text-white">Recent loads</h2>
          </div>
          <Link to="/loads" className="text-sm font-medium text-brand-300 hover:text-brand-200">
            View all →
          </Link>
        </div>
        <RecentLoadsTable
          loads={stats?.recentLoads ?? []}
          onLoadUpdated={handleLoadUpdated}
          onError={setError}
        />
      </div>
    </div>
  )
}
