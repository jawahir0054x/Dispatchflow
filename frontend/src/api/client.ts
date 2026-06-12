import type { ApiError } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiClientError extends Error {
  status: number
  details?: string[]

  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

function getToken(): string | null {
  return localStorage.getItem('dispatchflow_token')
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('dispatchflow_token', token)
  } else {
    localStorage.removeItem('dispatchflow_token')
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = data as ApiError | null
    throw new ApiClientError(
      error?.message ?? 'Request failed',
      response.status,
      error?.details,
    )
  }

  return data as T
}

export function buildPageParams(page: number, size: number, sort?: string): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  if (sort) {
    params.set('sort', sort)
  }
  return params.toString()
}

export async function apiBlobRequest(path: string): Promise<Blob> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { headers })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const error = data as ApiError | null
    throw new ApiClientError(
      error?.message ?? 'Request failed',
      response.status,
      error?.details,
    )
  }

  return response.blob()
}
