import apiClient from '../utils/api'
import type {
  ApiResponse,
  Item,
  CreateItemRequest,
  UpdateItemRequest,
} from '../types/api'

export const itemsService = {
  // Get all items
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Item[]>>(
      '/items',
    )
    return response.data
  },

  // Get item by ID
  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Item>>(`/items/${id}`)
    return response.data
  },

  // Create item
  create: async (data: CreateItemRequest) => {
    const response = await apiClient.post<ApiResponse<Item>>('/items', data)
    return response.data
  },

  // Update item
  update: async (id: number, data: UpdateItemRequest) => {
    const response = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, data)
    return response.data
  },

  // Delete item
  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/items/${id}`,
    )
    return response.data
  },
}
