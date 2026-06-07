import apiClient from '../utils/api'
import type {
  ApiResponse,
  ItemRequest,
  CreateRequestRequest,
} from '../types/api'

export const requestsService = {
  // Create request (User)
  create: async (data: CreateRequestRequest) => {
    const response = await apiClient.post<ApiResponse<ItemRequest>>('/requests', data)
    return response.data
  },

  // Get request by ID
  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<ItemRequest>>(`/requests/${id}`)
    return response.data
  },

  // Get my requests (User)
  getMyRequests: async () => {
    const response = await apiClient.get<ApiResponse<ItemRequest[]>>('/requests/my')
    return response.data
  },

  // Get pending requests (Admin)
  getPendingRequests: async () => {
    const response = await apiClient.get<ApiResponse<ItemRequest[]>>('/requests/pending/list')
    return response.data
  },

  // Approve request (Admin)
  approve: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<ItemRequest>>(
      `/requests/${id}/approve`
    )
    return response.data
  },

  // Reject request (Admin)
  reject: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<ItemRequest>>(
      `/requests/${id}/reject`
    )
    return response.data
  },
}
