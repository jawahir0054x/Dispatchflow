import type { DocumentType } from '../types'

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'RATE_CONFIRMATION', label: 'Rate Confirmation' },
  { value: 'BOL', label: 'BOL' },
  { value: 'POD', label: 'POD' },
  { value: 'LUMPER_RECEIPT', label: 'Lumper Receipt' },
]

export function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

export function isPreviewableContentType(contentType: string): boolean {
  return contentType === 'application/pdf' || contentType.startsWith('image/')
}
