import type { DashboardStats } from '../types'
import { apiRequest } from './client'

export function getDashboardStats() {
  return apiRequest<DashboardStats>('/api/dashboard/stats')
}
