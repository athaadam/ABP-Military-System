import apiClient from '../utils/api'
import type { ApiResponse, User } from '../types/api'

export const userService = {
  // Get all users (SuperAdmin)
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users')
    return response.data
  },

  // Get user by ID (SuperAdmin)
  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<User & { password?: string }>>(`/users/${id}`)
    return response.data
  },

  // Create user (SuperAdmin)
  create: async (data: {
    name: string
    email: string
    password: string
    role: 'admin' | 'user'
    unitId: string
  }) => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data)
    return response.data
  },

  // Update user (SuperAdmin)
  update: async (id: number, data: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  // Delete user (SuperAdmin)
  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/users/${id}`,
    )
    return response.data
  },

  // Reset password (SuperAdmin) - Generate new password
  resetPassword: async (id: number) => {
    const response = await apiClient.post<ApiResponse<{ password: string }>>(`/users/${id}/reset-password`, {})
    return response.data
  },
}
