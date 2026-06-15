import apiClient from '../utils/api'
import type {
  ApiResponse,
  Item,
  ItemDetail,
  CreateItemRequest,
  TransferItemConditionRequest,
  AddStockRequest,
  UpdateItemRequest,
} from '../types/api'

export const itemsService = {
  // Get all items
  getAll: async (unitId?: string) => {
    const params = unitId ? `?unitId=${unitId}` : ''
    const response = await apiClient.get<ApiResponse<Item[]>>(
      `/items${params}`,
    )
    return response.data
  },

  // Get item by ID
  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Item>>(`/items/${id}`)
    return response.data
  },

  getDetail: async (id: number) => {
    const response = await apiClient.get<ApiResponse<ItemDetail>>(`/items/${id}/detail`)
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

  transferCondition: async (id: number, data: TransferItemConditionRequest) => {
    const response = await apiClient.patch<ApiResponse<ItemDetail>>(
      `/items/${id}/condition-transfer`,
      data,
    )
    return response.data
  },

  addStock: async (id: number, data: AddStockRequest) => {
    const response = await apiClient.patch<ApiResponse<ItemDetail>>(
      `/items/${id}/add-stock`,
      data,
    )
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
