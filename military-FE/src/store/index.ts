import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import itemsReducer from './slices/itemsSlice'
import requestsReducer from './slices/requestsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    requests: requestsReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
