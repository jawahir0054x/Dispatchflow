import type { Load, LoadRequest, LoadStatus, PageResponse } from '../types'
import { apiRequest, buildPageParams } from './client'

export function getLoads(
  page = 0,
  size = 20,
  sort = 'createdAt,desc',
  driverId?: number,
  status?: LoadStatus,
) {
  const params = new URLSearchParams(buildPageParams(page, size, sort))
  if (driverId !== undefined) {
    params.set('driverId', String(driverId))
  }
  if (status !== undefined) {
    params.set('status', status)
  }
  return apiRequest<PageResponse<Load>>(`/api/loads?${params}`)
}

export function getLoad(id: number) {
  return apiRequest<Load>(`/api/loads/${id}`)
}

export function createLoad(request: LoadRequest) {
  return apiRequest<Load>('/api/loads', { method: 'POST', body: request })
}

export function updateLoad(id: number, request: LoadRequest) {
  return apiRequest<Load>(`/api/loads/${id}`, { method: 'PUT', body: request })
}

export function deleteLoad(id: number) {
  return apiRequest<void>(`/api/loads/${id}`, { method: 'DELETE' })
}
