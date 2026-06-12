import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import * as documentsApi from '../api/documents'
import * as loadsApi from '../api/loads'
import { ApiClientError } from '../api/client'
import { Alert } from '../components/Alert'
import { FormField, SelectInput } from '../components/FormField'
import { Modal } from '../components/Modal'
import type { DocumentType, Load, LoadDocument } from '../types'
import { DOCUMENT_TYPE_OPTIONS, documentTypeLabel, isPreviewableContentType } from '../utils/documents'
import { formatDate, formatFileSize } from '../utils/format'

export function DocumentsPage() {
  const [loads, setLoads] = useState<Load[]>([])
  const [selectedLoadId, setSelectedLoadId] = useState<number | ''>('')
  const [documents, setDocuments] = useState<LoadDocument[]>([])
  const [uploadType, setUploadType] = useState<DocumentType>('RATE_CONFIRMATION')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [loadingLoads, setLoadingLoads] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<LoadDocument | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    loadsApi
      .getLoads(0, 100, 'createdAt,desc')
      .then((res) => setLoads(res.content))
      .catch(() => setError('Failed to load list of loads'))
      .finally(() => setLoadingLoads(false))
  }, [])

  const loadDocuments = useCallback(async (loadId: number) => {
    setLoadingDocuments(true)
    setError(null)
    try {
      const data = await documentsApi.getDocuments(loadId)
      setDocuments(data)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  useEffect(() => {
    if (selectedLoadId === '') {
      setDocuments([])
      return
    }
    loadDocuments(selectedLoadId)
  }, [selectedLoadId, loadDocuments])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null)
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault()
    if (selectedLoadId === '' || !uploadFile) {
      return
    }

    setUploading(true)
    setError(null)
    try {
      await documentsApi.uploadDocument(selectedLoadId, uploadType, uploadFile)
      setUploadFile(null)
      const input = document.getElementById('document-upload-input') as HTMLInputElement | null
      if (input) input.value = ''
      await loadDocuments(selectedLoadId)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(doc: LoadDocument) {
    setError(null)
    try {
      const blob = await documentsApi.downloadDocument(doc.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = doc.originalFilename
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to download document')
    }
  }

  async function handlePreview(doc: LoadDocument) {
    if (!isPreviewableContentType(doc.contentType)) {
      setError('Preview is only available for PDF and image files')
      return
    }

    setPreviewLoading(true)
    setError(null)
    try {
      const blob = await documentsApi.previewDocument(doc.id)
      const url = URL.createObjectURL(blob)
      setPreviewDoc(doc)
      setPreviewUrl(url)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to preview document')
    } finally {
      setPreviewLoading(false)
    }
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setPreviewDoc(null)
  }

  async function handleDelete(doc: LoadDocument) {
    if (!confirm(`Delete "${doc.originalFilename}"?`)) {
      return
    }

    setError(null)
    try {
      await documentsApi.deleteDocument(doc.id)
      if (selectedLoadId !== '') {
        await loadDocuments(selectedLoadId)
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete document')
    }
  }

  const selectedLoad = loads.find((load) => load.id === selectedLoadId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-500">
          Upload and manage load documents — rate confirmations, BOLs, PODs, and lumper receipts.
        </p>
      </div>

      {error && <Alert message={error} />}

      <FormField label="Select load">
        <SelectInput
          value={selectedLoadId}
          onChange={(e) => setSelectedLoadId(e.target.value ? Number(e.target.value) : '')}
          className="max-w-xl"
          disabled={loadingLoads}
        >
          <option value="">
            {loadingLoads ? 'Loading loads...' : 'Choose a load...'}
          </option>
          {loads.map((load) => (
            <option key={load.id} value={load.id}>
              {load.loadNumber} — {load.brokerName} ({load.pickupCity} → {load.deliveryCity})
            </option>
          ))}
        </SelectInput>
      </FormField>

      {selectedLoad && (
        <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{selectedLoad.loadNumber}</span>
          {' · '}
          {selectedLoad.brokerName} · {selectedLoad.pickupCity} → {selectedLoad.deliveryCity}
        </div>
      )}

      {selectedLoadId !== '' && (
        <>
          <form
            onSubmit={handleUpload}
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm"
          >
            <FormField label="Document type">
              <SelectInput
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as DocumentType)}
                className="min-w-48"
              >
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="File (PDF or image, max 10MB)">
              <input
                id="document-upload-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.tiff,application/pdf,image/*"
                onChange={handleFileChange}
                className="block w-full min-w-64 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                required
              />
            </FormField>
            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-surface-200 bg-surface-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Filename</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Uploaded</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDocuments ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Loading documents...
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No documents uploaded for this load yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-surface-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {documentTypeLabel(doc.documentType)}
                        </td>
                        <td className="px-4 py-3">{doc.originalFilename}</td>
                        <td className="px-4 py-3 text-slate-600">{formatFileSize(doc.fileSize)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(doc.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {isPreviewableContentType(doc.contentType) && (
                              <button
                                type="button"
                                onClick={() => handlePreview(doc)}
                                className="text-slate-600 hover:text-slate-900"
                              >
                                Preview
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              className="text-brand-600 hover:text-brand-700"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(doc)}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal
        title={previewDoc ? previewDoc.originalFilename : 'Preview'}
        open={previewDoc !== null}
        onClose={closePreview}
      >
        {previewLoading && <p className="py-8 text-center text-sm text-slate-500">Loading preview...</p>}
        {!previewLoading && previewUrl && previewDoc && (
          <div className="max-h-[70vh] overflow-auto">
            {previewDoc.contentType === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                title={previewDoc.originalFilename}
                className="h-[65vh] w-full rounded-lg border border-surface-200"
              />
            ) : (
              <img
                src={previewUrl}
                alt={previewDoc.originalFilename}
                className="mx-auto max-h-[65vh] max-w-full rounded-lg"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
