import type { DocumentType, LoadDocument } from '../types'
import { ApiClientError, apiBlobRequest, apiRequest } from './client'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function getToken(): string | null {
  return localStorage.getItem('dispatchflow_token')
}

export function getDocuments(loadId: number, documentType?: DocumentType) {
  const params = new URLSearchParams({ loadId: String(loadId) })
  if (documentType) {
    params.set('documentType', documentType)
  }
  return apiRequest<LoadDocument[]>(`/api/documents?${params}`)
}

export function getDocument(id: number) {
  return apiRequest<LoadDocument>(`/api/documents/${id}`)
}

export async function uploadDocument(loadId: number, documentType: DocumentType, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const params = new URLSearchParams({
    loadId: String(loadId),
    documentType,
  })

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}/api/documents?${params}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiClientError(data?.message ?? 'Upload failed', response.status, data?.details)
  }

  return data as LoadDocument
}

export function deleteDocument(id: number) {
  return apiRequest<void>(`/api/documents/${id}`, { method: 'DELETE' })
}

export function downloadDocument(id: number) {
  return apiBlobRequest(`/api/documents/${id}/download`)
}

export function previewDocument(id: number) {
  return apiBlobRequest(`/api/documents/${id}/preview`)
}
