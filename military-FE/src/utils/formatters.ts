import { format, parseISO, formatDistanceToNow } from 'date-fns'

export const formatters = {
  // Date formatting
  formatDate: (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, formatStr)
    } catch {
      return '-'
    }
  },

  // Date time formatting
  formatDateTime: (date: string | Date, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, formatStr)
    } catch {
      return '-'
    }
  },

  // Relative time (e.g., "2 hours ago")
  formatTimeAgo: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
      return '-'
    }
  },

  // Currency formatting (IDR)
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  },

  // Number formatting
  formatNumber: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  },

  // Percentage formatting
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${formatters.formatNumber(value, decimals)}%`
  },

  // File size formatting
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  },

  // Text truncate
  truncate: (text: string, length: number = 50): string => {
    return text.length > length ? text.substring(0, length) + '...' : text
  },

  // Capitalize first letter
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  // Capitalize all words
  capitalizeWords: (text: string): string => {
    return text
      .split(' ')
      .map((word) => formatters.capitalize(word))
      .join(' ')
  },

  // Phone number formatting
  formatPhoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})(\d+)$/)
    if (match) {
      return `${match[1]} ${match[2]}-${match[3]}-${match[4]}`
    }
    return phone
  },
}
