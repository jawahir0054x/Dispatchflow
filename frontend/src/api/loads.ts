import type { Load, LoadRequest, LoadStatus, PageResponse } from '../types'
import { apiRequest, buildPageParams } from './client'

export function getLoads(
  page = 0,
  size = 20,
  sort = 'createdAt,desc',
  driverId?: number,
  status?: LoadStatus,
  search?: string,
  broker?: string,
  driver?: string,
) {
  const params = new URLSearchParams(buildPageParams(page, size, sort))
  if (driverId !== undefined) {
    params.set('driverId', String(driverId))
  }
  if (status !== undefined) {
    params.set('status', status)
  }
  if (search) {
    params.set('search', search)
  }
  if (broker) {
    params.set('broker', broker)
  }
  if (driver) {
    params.set('driver', driver)
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

export function updateLoadStatus(id: number, status: LoadStatus) {
  return apiRequest<Load>(`/api/loads/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}
