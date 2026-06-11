import type { Carrier, CarrierRequest, PageResponse } from '../types'
import { apiRequest, buildPageParams } from './client'

export function getCarriers(page = 0, size = 20, sort = 'name,asc') {
  const params = buildPageParams(page, size, sort)
  return apiRequest<PageResponse<Carrier>>(`/api/carriers?${params}`)
}

export function getCarrier(id: number) {
  return apiRequest<Carrier>(`/api/carriers/${id}`)
}

export function createCarrier(request: CarrierRequest) {
  return apiRequest<Carrier>('/api/carriers', { method: 'POST', body: request })
}

export function updateCarrier(id: number, request: CarrierRequest) {
  return apiRequest<Carrier>(`/api/carriers/${id}`, { method: 'PUT', body: request })
}

export function deleteCarrier(id: number) {
  return apiRequest<void>(`/api/carriers/${id}`, { method: 'DELETE' })
}
