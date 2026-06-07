import apiClient from '../utils/api'
import type {
  ApiResponse,
  ItemReturn,
  CreateReturnRequest,
} from '../types/api'

export const returnService = {
  // Create return
  create: async (data: CreateReturnRequest) => {
    const response = await apiClient.post<ApiResponse<ItemReturn>>('/returns', data)
    return response.data
  },
}
