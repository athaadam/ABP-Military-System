import apiClient from '../utils/api'
import type { ApiResponse, LoginRequest, AuthApiResponse, User } from '../types/api'

export const authService = {
  // Login
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthApiResponse>(
      '/auth/login',
      credentials,
    )
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data
  },

  // Logout (client-side only, removes token)
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('token')
  },
}
