import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Item {
  id: number
  item_code: string
  item_name: string
  description: string
  category: string
  quantity: number
  unit: string
  warehouse_id: number
  condition?: string
  last_updated?: string
}

interface ItemsState {
  items: Item[]
  isLoading: boolean
  error: string | null
  selectedItem: Item | null
  filters: {
    searchTerm: string
    category: string
    warehouse_id?: number
  }
}

const initialState: ItemsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
  filters: {
    searchTerm: '',
    category: '',
  },
}

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // Fetch items
    fetchItemsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchItemsSuccess: (state, action: PayloadAction<Item[]>) => {
      state.isLoading = false
      state.items = action.payload
    },
    fetchItemsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Add item
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload)
    },

    // Update item
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },

    // Delete item
    deleteItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    // Select item
    selectItem: (state, action: PayloadAction<Item | null>) => {
      state.selectedItem = action.payload
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<ItemsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        category: '',
      }
    },
  },
})

export const {
  fetchItemsStart,
  fetchItemsSuccess,
  fetchItemsFailure,
  addItem,
  updateItem,
  deleteItem,
  selectItem,
  setFilters,
  clearFilters,
} = itemsSlice.actions

export default itemsSlice.reducer
