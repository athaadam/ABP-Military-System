import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface UIState {
  sidebarOpen: boolean
  notifications: Notification[]
  isModalOpen: boolean
  modalType: string | null
  loading: boolean
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  sidebarOpen: true,
  notifications: [],
  isModalOpen: false,
  modalType: null,
  loading: false,
  theme: 'dark',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },

    // Modal
    openModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true
      state.modalType = action.payload
    },
    closeModal: (state) => {
      state.isModalOpen = false
      state.modalType = null
    },

    // Loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
  toggleTheme,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer
