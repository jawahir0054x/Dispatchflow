import type { DashboardStats } from '../types'
import { formatCurrency } from './format'

export function metricDisplay(
  stats: DashboardStats | null,
  loading: boolean,
  pick: (s: DashboardStats) => number,
  format: (value: number) => string = (value) => String(value),
): string {
  if (loading || !stats) {
    return '—'
  }
  return format(pick(stats))
}

export function metricSubtitle(
  stats: DashboardStats | null,
  loading: boolean,
  text: (s: DashboardStats) => string,
): string | undefined {
  if (loading || !stats) {
    return undefined
  }
  return text(stats)
}

export const dashboardMetricFormatters = {
  currency: (value: number) => formatCurrency(value),
  count: (value: number) => value.toLocaleString(),
  percent: (value: number) => `${value.toFixed(1)}%`,
}
