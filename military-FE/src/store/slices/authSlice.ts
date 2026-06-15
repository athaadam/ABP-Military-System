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
  selectedUnitId: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isInitializing: true,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  selectedUnitId: localStorage.getItem('selectedUnitId') || null,
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
      // For superadmin, use persisted selectedUnitId; for others use their unitId
      if (action.payload.role === 'superadmin') {
        if (!state.selectedUnitId) {
          state.selectedUnitId = null
        }
      } else {
        state.selectedUnitId = action.payload.unitId
      }
    },

    // Set selected unit for superadmin
    setSelectedUnit: (state, action: PayloadAction<string>) => {
      state.selectedUnitId = action.payload
      localStorage.setItem('selectedUnitId', action.payload)
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
  setSelectedUnit,
} = authSlice.actions

export default authSlice.reducer
