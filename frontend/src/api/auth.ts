import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'
import { apiRequest } from './client'

export function login(request: LoginRequest) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: request,
    auth: false,
  })
}

export function register(request: RegisterRequest) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: request,
    auth: false,
  })
}
