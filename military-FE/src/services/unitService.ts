import apiClient from '../utils/api'
import type { ApiResponse, Unit, CreateUnitRequest, UpdateUnitRequest, PaginationParams } from '../types/api'

export const unitService = {
  // Get all units
  getAll: async (params?: PaginationParams) => {
    const response = await apiClient.get<ApiResponse<Unit[]>>(
      '/units',
      { params },
    )
    return response.data
  },

  // Get unit by ID (code)
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Unit>>(`/units/info/${id}`)
    return response.data
  },

  // Create unit
  create: async (data: CreateUnitRequest) => {
    const response = await apiClient.post<ApiResponse<Unit>>('/units', data)
    return response.data
  },

  // Update unit
  update: async (id: string, data: UpdateUnitRequest) => {
    const response = await apiClient.put<ApiResponse<Unit>>(`/units/${id}`, data)
    return response.data
  },

  // Delete unit
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/units/${id}`,
    )
    return response.data
  },
}
