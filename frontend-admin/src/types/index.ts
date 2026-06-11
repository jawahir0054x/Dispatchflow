export type Role = 'ADMIN' | 'DISPATCHER'

export type TrailerType =
  | 'DRY_VAN'
  | 'REEFER'
  | 'FLATBED'
  | 'STEP_DECK'
  | 'LOWBOY'
  | 'TANKER'
  | 'OTHER'

export type LoadStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

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
  createdAt: string
  updatedAt: string
}

export interface CarrierRequest {
  name: string
  mcNumber: string
  dotNumber: string
  phone: string
  email: string
}

export interface Driver {
  id: number
  name: string
  phone: string
  truckNumber: string
  trailerType: TrailerType
  currentLocation: string
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
}

export interface Load {
  id: number
  brokerName: string
  pickupCity: string
  deliveryCity: string
  rate: number
  miles: number
  status: LoadStatus
  driverId: number
  driverName: string
  createdAt: string
  updatedAt: string
}

export interface LoadRequest {
  driverId: number
  brokerName: string
  pickupCity: string
  deliveryCity: string
  rate: number
  miles: number
  status: LoadStatus
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}

export interface UserRecord {
  id: number
  email: string
  firstName: string
  lastName: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface UserRequest {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: Role
}
