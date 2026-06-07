import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ItemRequest {
  id: number
  request_number: string
  user_id: number
  item_id: number
  quantity_requested: number
  quantity_approved?: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  purpose: string
  request_date: string
  approval_date?: string
  approved_by?: number
  notes?: string
}

interface RequestsState {
  requests: ItemRequest[]
  isLoading: boolean
  error: string | null
  selectedRequest: ItemRequest | null
  filters: {
    status: 'all' | 'pending' | 'approved' | 'rejected' | 'completed'
    searchTerm: string
  }
}

const initialState: RequestsState = {
  requests: [],
  isLoading: false,
  error: null,
  selectedRequest: null,
  filters: {
    status: 'all',
    searchTerm: '',
  },
}

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    // Fetch requests
    fetchRequestsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchRequestsSuccess: (state, action: PayloadAction<ItemRequest[]>) => {
      state.isLoading = false
      state.requests = action.payload
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Add request
    addRequest: (state, action: PayloadAction<ItemRequest>) => {
      state.requests.push(action.payload)
    },

    // Update request
    updateRequest: (state, action: PayloadAction<ItemRequest>) => {
      const index = state.requests.findIndex((req) => req.id === action.payload.id)
      if (index !== -1) {
        state.requests[index] = action.payload
      }
    },

    // Approve request
    approveRequest: (state, action: PayloadAction<{ id: number; quantity_approved: number }>) => {
      const request = state.requests.find((req) => req.id === action.payload.id)
      if (request) {
        request.status = 'approved'
        request.quantity_approved = action.payload.quantity_approved
      }
    },

    // Reject request
    rejectRequest: (state, action: PayloadAction<number>) => {
      const request = state.requests.find((req) => req.id === action.payload)
      if (request) {
        request.status = 'rejected'
      }
    },

    // Delete request
    deleteRequest: (state, action: PayloadAction<number>) => {
      state.requests = state.requests.filter((req) => req.id !== action.payload)
    },

    // Select request
    selectRequest: (state, action: PayloadAction<ItemRequest | null>) => {
      state.selectedRequest = action.payload
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<RequestsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        searchTerm: '',
      }
    },
  },
})

export const {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  addRequest,
  updateRequest,
  approveRequest,
  rejectRequest,
  deleteRequest,
  selectRequest,
  setFilters,
  clearFilters,
} = requestsSlice.actions

export default requestsSlice.reducer
