// API Response Types

export interface ApiResponse<T> {
  message: string
  data?: T
  status?: 'success' | 'error'
  errors?: Record<string, string[]>
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  id: number
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'user'
  unitId: string
  token: string
}

export interface AuthApiResponse {
  token: string
  user: Omit<AuthResponse, 'token'>
}

export interface User {
  id: number
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'user'
  unitId: string
  created_at?: string
  updated_at?: string
}

// Unit Types
export interface Unit {
  id: string
  name: string
  logo?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUnitRequest {
  id: string
  name: string
  logo?: string
}

export interface UpdateUnitRequest {
  name: string
  logo?: string
}

// Warehouse Types
export interface Warehouse {
  id: number
  name: string
  unitId: string
  created_at?: string
  updated_at?: string
}

export interface CreateWarehouseRequest {
  name: string
  unitId: string
}

export interface UpdateWarehouseRequest {
  name?: string
  unitId?: string
}

// Item Types
export interface Item {
  id: number
  name: string
  category: 'Persenjataan' | 'Amunisi' | 'Kendaraan Militer'
  stock: number
  condition: 'Aktif' | 'Digunakan' | 'Rusak' | 'Perbaikan' | 'Cadangan' | 'Habis'
  warehouseId: number
  imageUrl?: string
  warehouseName?: string
  unitId?: string
  created_at?: string
  updated_at?: string
}

export interface CreateItemRequest {
  name: string
  category: 'Persenjataan' | 'Amunisi' | 'Kendaraan Militer'
  stock: number
  condition?: 'Aktif' | 'Digunakan' | 'Rusak' | 'Perbaikan' | 'Cadangan' | 'Habis'
  warehouseId: number
  imageUrl: string
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

// Request Types
export interface ItemRequest {
  id: number
  userId: number
  itemId: number
  quantity: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approvedBy?: number
  created_at?: string
  updated_at?: string
}

export interface CreateRequestRequest {
  itemId: number
  quantity: number
  reason: string
}

export interface ApproveRequestRequest {
  // Empty body - approval done via PATCH endpoint
}

// Return Types
export interface ItemReturn {
  id: number
  requestId: number
  conditionAfter: 'Aktif' | 'Rusak' | 'Perbaikan'
  created_at?: string
  updated_at?: string
}

export interface CreateReturnRequest {
  requestId: number
  conditionAfter: 'Aktif' | 'Rusak' | 'Perbaikan'
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
