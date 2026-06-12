import type { LoadAnalysisRequest, LoadAnalysisResponse } from '../types'
import { apiRequest } from './client'

export function analyzeLoad(request: LoadAnalysisRequest) {
  return apiRequest<LoadAnalysisResponse>('/api/loads/analyze', {
    method: 'POST',
    body: request,
  })
}
