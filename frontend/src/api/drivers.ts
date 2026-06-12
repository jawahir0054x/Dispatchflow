import type { Driver, DriverRequest, PageResponse } from '../types'
import { apiRequest, buildPageParams } from './client'

export function getDrivers(
  page = 0,
  size = 20,
  sort = 'name,asc',
  carrierId?: number,
  search?: string,
) {
  const params = new URLSearchParams(buildPageParams(page, size, sort))
  if (carrierId !== undefined) {
    params.set('carrierId', String(carrierId))
  }
  if (search?.trim()) {
    params.set('search', search.trim())
  }
  return apiRequest<PageResponse<Driver>>(`/api/drivers?${params}`)
}

export function getDriver(id: number) {
  return apiRequest<Driver>(`/api/drivers/${id}`)
}

export function createDriver(request: DriverRequest) {
  return apiRequest<Driver>('/api/drivers', { method: 'POST', body: request })
}

export function updateDriver(id: number, request: DriverRequest) {
  return apiRequest<Driver>(`/api/drivers/${id}`, { method: 'PUT', body: request })
}

export function deleteDriver(id: number) {
  return apiRequest<void>(`/api/drivers/${id}`, { method: 'DELETE' })
}
