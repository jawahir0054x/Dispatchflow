export type Role = 'ADMIN' | 'DISPATCHER'

export type TrailerType =
  | 'DRY_VAN'
  | 'REEFER'
  | 'FLATBED'
  | 'STEP_DECK'
  | 'LOWBOY'
  | 'TANKER'
  | 'OTHER'

export type DriverStatus = 'AVAILABLE' | 'UNDER_LOAD' | 'OFF_DUTY'

export type LoadStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PAID'

export interface AuthResponse {
  token: string
  tokenType: string
  userId: number
  email: string
  firstName: string
  lastName: string
  role: Role
}

export interface User {
  userId: number
  email: string
  firstName: string
  lastName: string
  role: Role
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details?: string[]
}

export interface Carrier {
  id: number
  name: string
  mcNumber: string
  dotNumber: string
  phone: string
  email: string
  insuranceExpiryDate: string
  createdAt: string
  updatedAt: string
}

export interface CarrierRequest {
  name: string
  mcNumber: string
  dotNumber: string
  phone: string
  email: string
  insuranceExpiryDate: string
}

export interface Driver {
  id: number
  name: string
  phone: string
  truckNumber: string
  trailerType: TrailerType
  currentLocation: string
  status: DriverStatus
  carrierId: number
  carrierName: string
  createdAt: string
  updatedAt: string
}

export interface DriverRequest {
  carrierId: number
  name: string
  phone: string
  truckNumber: string
  trailerType: TrailerType
  currentLocation: string
  status: DriverStatus
}

export interface Load {
  id: number
  loadNumber: string
  referenceNumber?: string | null
  brokerName: string
  pickupCity: string
  deliveryCity: string
  commodity: string
  rate: number
  miles: number
  deadheadMiles: number
  pickupDate: string
  deliveryDate: string
  status: LoadStatus
  driverId?: number | null
  driverName?: string | null
  carrierName?: string | null
  ratePerMile: number
  deadheadPercentage: number
  estimatedProfit: number
  createdAt: string
  updatedAt: string
}

export interface LoadRequest {
  driverId?: number | null
  referenceNumber?: string
  brokerName: string
  pickupCity: string
  deliveryCity: string
  commodity: string
  rate: number
  miles: number
  deadheadMiles?: number
  pickupDate: string
  deliveryDate: string
  status: LoadStatus
}

export interface LoginRequest {
  email: string
  password: string
}

export interface DashboardStats {
  totalCarriers: number
  totalDrivers: number
  totalLoads: number
  activeLoadsCount: number
  totalUsers?: number | null
  activeDrivers: number
  idleDrivers: number
  loadsThisWeek: number
  loadsByStatus: Record<LoadStatus, number>
  totalRevenue: number
  deliveredRevenue: number
  pipelineRevenue: number
  avgRatePerMile: number
  totalEstimatedProfit: number
  avgDeadheadPercentage: number
  totalMiles: number
  recentLoads: Load[]
  activeLoads: Load[]
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}

export type DocumentType =
  | 'RATE_CONFIRMATION'
  | 'BOL'
  | 'POD'
  | 'LUMPER_RECEIPT'

export interface LoadDocument {
  id: number
  loadId: number
  loadNumber: string
  documentType: DocumentType
  originalFilename: string
  contentType: string
  fileSize: number
  createdAt: string
  updatedAt: string
}

export interface DeadheadCalculationRequest {
  currentLocation: string
  pickupLocation: string
}

export interface DeadheadCalculationResponse {
  currentLocation: string
  pickupLocation: string
  resolvedCurrentLocation: string
  resolvedPickupLocation: string
  deadheadMiles: number
}

export type LoadGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export type LoadRecommendation = 'GOOD_LOAD' | 'AVERAGE_LOAD' | 'AVOID_LOAD'

export interface LoadAnalysisRequest {
  rate: number
  miles: number
  deadheadMiles?: number
}

export interface LoadAnalysisResponse {
  ratePerMile: number
  profitabilityScore: number
  loadGrade: LoadGrade
  recommendation: LoadRecommendation
}
