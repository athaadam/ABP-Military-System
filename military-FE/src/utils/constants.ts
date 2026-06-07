// Routes Constants
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/dashboard/admin',
  SUPER_ADMIN_DASHBOARD: '/dashboard/super-admin',

  // Items
  ITEMS: '/items',
  ITEMS_DETAIL: '/items/:id',

  // Requests
  REQUESTS: '/requests',
  MY_REQUESTS: '/requests/my',
  CREATE_REQUEST: '/requests/create',
  REQUEST_DETAIL: '/requests/:id',

  // Admin - Items
  ADMIN_ITEMS: '/admin/items',
  ADMIN_ITEMS_DETAIL: '/admin/items/:id',

  // Admin - Requests
  ADMIN_REQUESTS: '/admin/requests',
  ADMIN_REQUESTS_DETAIL: '/admin/requests/:id',

  // Admin - Warehouses
  ADMIN_WAREHOUSES: '/admin/warehouses',

  // Admin - Users
  ADMIN_USERS: '/admin/users',

  // Admin - Returns
  ADMIN_RETURNS: '/admin/returns',

  // Super Admin - Units
  SUPER_ADMIN_UNITS: '/admin/units',

  // Profile
  PROFILE: '/profile',

  // Error Pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',

  // Items
  ITEMS: '/items',
  ITEMS_BY_WAREHOUSE: '/items/warehouse',
  ITEMS_SEARCH: '/items/search',

  // Requests
  REQUESTS: '/requests',
  REQUESTS_PENDING: '/requests/pending',
  REQUESTS_APPROVE: '/requests/:id/approve',
  REQUESTS_REJECT: '/requests/:id/reject',

  // Users
  USERS: '/users',
  USERS_BY_UNIT: '/users/unit',

  // Warehouses
  WAREHOUSES: '/warehouses',
  WAREHOUSES_CAPACITY: '/warehouses/:id/capacity',

  // Units
  UNITS: '/units',

  // Returns
  RETURNS: '/returns',
}

// Status Constants
export const ITEM_STATUS = {
  BAIK: 'baik',
  RUSAK: 'rusak',
  PERBAIKAN: 'perbaikan',
} as const

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
} as const

// Token
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'
export const TOKEN_EXPIRY = 8 * 60 * 60 * 1000 // 8 hours in ms
