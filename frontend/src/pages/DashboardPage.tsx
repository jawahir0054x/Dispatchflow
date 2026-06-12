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
} from '../components/Icons'
import { LoadStatusChart } from '../components/LoadStatusChart'
import { RecentLoadsTable } from '../components/RecentLoadsTable'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import type { DashboardStats } from '../types'
import {
  dashboardMetricFormatters,
  metricDisplay,
  metricSubtitle,
} from '../utils/dashboardMetrics'
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
      setStats(null)
      setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  function handleLoadUpdated() {
    loadStats()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-slate-500">
            Live dispatch metrics, revenue tracking, and load board overview.
          </p>
        </div>
        <Link
          to="/loads"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + New load
        </Link>
      </div>

      {error && <Alert message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={metricDisplay(stats, loading, (s) => s.totalRevenue, dashboardMetricFormatters.currency)}
          subtitle={metricSubtitle(stats, loading, (s) => `${formatCurrency(s.pipelineRevenue)} in pipeline`)}
          icon={<DollarIcon className="h-5 w-5" />}
          color="from-emerald-500 to-emerald-700"
        />
        <StatCard
          label="Active loads"
          value={metricDisplay(stats, loading, (s) => s.activeLoadsCount, dashboardMetricFormatters.count)}
          subtitle={metricSubtitle(stats, loading, (s) => `${s.loadsThisWeek.toLocaleString()} new this week`)}
          icon={<PackageIcon className="h-5 w-5" />}
          href="/loads?status=IN_TRANSIT"
          color="from-brand-500 to-brand-700"
        />
        <StatCard
          label="Fleet drivers"
          value={metricDisplay(stats, loading, (s) => s.totalDrivers, dashboardMetricFormatters.count)}
          subtitle={metricSubtitle(
            stats,
            loading,
            (s) => `${s.activeDrivers.toLocaleString()} on load · ${s.idleDrivers.toLocaleString()} available`,
          )}
          icon={<TruckIcon className="h-5 w-5" />}
          href="/drivers"
          color="from-indigo-500 to-indigo-700"
        />
        <StatCard
          label="Avg rate / mile"
          value={metricDisplay(stats, loading, (s) => s.avgRatePerMile, dashboardMetricFormatters.currency)}
          subtitle={metricSubtitle(stats, loading, (s) => `${s.totalMiles.toLocaleString()} total miles`)}
          icon={<RouteIcon className="h-5 w-5" />}
          color="from-violet-500 to-violet-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-5 flex items-center gap-2">
            <ChartIcon className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Load pipeline</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading metrics...</p>
          ) : stats ? (
            <LoadStatusChart loadsByStatus={stats.loadsByStatus} />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:col-span-2">
          <StatCard
            label="Carriers"
            value={metricDisplay(stats, loading, (s) => s.totalCarriers, dashboardMetricFormatters.count)}
            icon={<BuildingIcon className="h-5 w-5" />}
            href="/carriers"
            variant="light"
          />
          <StatCard
            label="Delivered revenue"
            value={metricDisplay(stats, loading, (s) => s.deliveredRevenue, dashboardMetricFormatters.currency)}
            icon={<DollarIcon className="h-5 w-5" />}
            variant="light"
          />
          <StatCard
            label="Estimated profit"
            value={metricDisplay(
              stats,
              loading,
              (s) => s.totalEstimatedProfit,
              dashboardMetricFormatters.currency,
            )}
            subtitle={metricSubtitle(stats, loading, (s) => `${formatCurrency(s.avgRatePerMile)}/mi avg RPM`)}
            icon={<DollarIcon className="h-5 w-5" />}
            variant="light"
          />
          <StatCard
            label="Avg deadhead"
            value={metricDisplay(
              stats,
              loading,
              (s) => s.avgDeadheadPercentage,
              dashboardMetricFormatters.percent,
            )}
            subtitle={metricSubtitle(stats, loading, (s) => `${s.totalMiles.toLocaleString()} loaded mi`)}
            icon={<RouteIcon className="h-5 w-5" />}
            variant="light"
          />
          <StatCard
            label="Total loads"
            value={metricDisplay(stats, loading, (s) => s.totalLoads, dashboardMetricFormatters.count)}
            icon={<ActivityIcon className="h-5 w-5" />}
            href="/loads"
            variant="light"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Active dispatch board</h2>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {metricDisplay(stats, loading, (s) => s.activeLoadsCount, dashboardMetricFormatters.count)} in motion
          </span>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">Loading active loads...</p>
        ) : (
          <RecentLoadsTable
            loads={stats?.activeLoads ?? []}
            onLoadUpdated={handleLoadUpdated}
            onError={setError}
          />
        )}
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent loads</h2>
          </div>
          <Link to="/loads" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">Loading recent loads...</p>
        ) : (
          <RecentLoadsTable
            loads={stats?.recentLoads ?? []}
            onLoadUpdated={handleLoadUpdated}
            onError={setError}
          />
        )}
      </div>
    </div>
  )
}
