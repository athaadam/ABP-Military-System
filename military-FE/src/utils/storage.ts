// Storage utilities for localStorage management

export const storage = {
  // Token
  setToken: (token: string) => {
    localStorage.setItem('token', token)
  },
  getToken: () => {
    return localStorage.getItem('token')
  },
  removeToken: () => {
    localStorage.removeItem('token')
  },

  // User
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user))
  },
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  removeUser: () => {
    localStorage.removeItem('user')
  },

  // Theme
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme)
  },
  getTheme: () => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  },

  // Generic
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: (key: string) => {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
  clear: () => {
    localStorage.clear()
  },
}
