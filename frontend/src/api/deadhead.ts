import type { DeadheadCalculationRequest, DeadheadCalculationResponse } from '../types'
import { apiRequest } from './client'

export function calculateDeadhead(request: DeadheadCalculationRequest) {
  return apiRequest<DeadheadCalculationResponse>('/api/deadhead/calculate', {
    method: 'POST',
    body: request,
  })
}
