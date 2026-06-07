import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'user'
  unitId: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isInitializing: true,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.isAuthenticated = false
    },

    // Logout
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },

    // Restore user from token
    restoreUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Initialize auth
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreUser,
  clearError,
  setInitializing,
} = authSlice.actions

export default authSlice.reducer
