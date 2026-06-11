import type { PageResponse, UserRecord, UserRequest } from '../types'
import { apiRequest, buildPageParams } from './client'

export function getUsers(page = 0, size = 20, sort = 'email,asc') {
  const params = buildPageParams(page, size, sort)
  return apiRequest<PageResponse<UserRecord>>(`/api/users?${params}`)
}

export function createUser(request: UserRequest) {
  return apiRequest<UserRecord>('/api/users', { method: 'POST', body: request })
}

export function updateUser(id: number, request: UserRequest) {
  return apiRequest<UserRecord>(`/api/users/${id}`, { method: 'PUT', body: request })
}

export function deleteUser(id: number) {
  return apiRequest<void>(`/api/users/${id}`, { method: 'DELETE' })
}
