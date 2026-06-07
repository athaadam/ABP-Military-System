import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'
import type { ApiResponse } from '../types/api'

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState()
    let token = state.auth.token

    // Fallback to localStorage if Redux token is not available
    if (!token) {
      token = localStorage.getItem('token')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response
  },
  (error: AxiosError<ApiResponse<any>>) => {
    // Don't handle 401 errors for auth endpoints (login/register/me)
    const isAuthEndpoint = 
      error.config?.url?.includes('/auth/login') || 
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/me')
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired or invalid
      store.dispatch(logout())
      window.location.href = '/login'
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access Forbidden - Insufficient permissions')
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server Error')
    }

    return Promise.reject(error)
  },
)

export default apiClient
