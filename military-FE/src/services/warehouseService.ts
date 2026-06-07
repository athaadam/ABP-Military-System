import apiClient from '../utils/api'
import type { ApiResponse, Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest, PaginationParams } from '../types/api'

export const warehouseService = {
  // Get all warehouses
  getAll: async (params?: PaginationParams) => {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>(
      '/warehouses',
      { params },
    )
    return response.data
  },

  // Get warehouse by ID
  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`)
    return response.data
  },

  // Create warehouse
  create: async (data: CreateWarehouseRequest) => {
    const response = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', data)
    return response.data
  },

  // Update warehouse
  update: async (id: number, data: UpdateWarehouseRequest) => {
    const response = await apiClient.put<ApiResponse<Warehouse>>(
      `/warehouses/${id}`,
      data,
    )
    return response.data
  },

  // Delete warehouse
  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/warehouses/${id}`,
    )
    return response.data
  },
}
