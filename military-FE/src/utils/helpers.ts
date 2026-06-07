// Helper utilities

export const helpers = {
  // Check if object is empty
  isEmpty: (obj: any): boolean => {
    return Object.keys(obj).length === 0
  },

  // Deep clone object
  deepClone: <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  },

  // Merge objects
  mergeObjects: <T,>(...objects: Partial<T>[]): T => {
    return Object.assign({}, ...objects) as T
  },

  // Get value from nested object
  getNestedValue: (obj: any, path: string, defaultValue: any = null): any => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result && typeof result === 'object') {
        result = result[key]
      } else {
        return defaultValue
      }
    }
    return result !== undefined ? result : defaultValue
  },

  // Convert array to object by key
  arrayToObject: <T,>(array: T[], key: keyof T): Record<any, T> => {
    return array.reduce(
      (obj, item) => {
        obj[item[key] as any] = item
        return obj
      },
      {} as Record<any, T>,
    )
  },

  // Filter object by keys
  filterObject: <T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Partial<T> => {
    const result: any = {}
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },

  // Remove null/undefined values from object
  compactObject: <T,>(obj: T): Partial<T> => {
    const result: any = {}
    Object.entries(obj as any).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        result[key] = value
      }
    })
    return result
  },

  // Delay function (promise)
  delay: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): ((...args: Parameters<T>) => void) => {
    let lastRun = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun >= limit) {
        func(...args)
        lastRun = now
      }
    }
  },

  // Generate unique ID
  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Check if variable is empty (null, undefined, empty string, 0, false)
  isNullish: (value: any): boolean => {
    return value === null || value === undefined || value === '' || value === 0 || value === false
  },

  // Safe JSON parse
  safeJsonParse: <T,>(json: string, defaultValue: T): T => {
    try {
      return JSON.parse(json)
    } catch {
      return defaultValue
    }
  },

  // Group array by key
  groupBy: <T,>(array: T[], key: keyof T): Record<any, T[]> => {
    return array.reduce(
      (result, item) => {
        const group = item[key] as any
        if (!result[group]) {
          result[group] = []
        }
        result[group].push(item)
        return result
      },
      {} as Record<any, T[]>,
    )
  },

  // Sort array by object key
  sortBy: <T,>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return order === 'asc' ? -1 : 1
      if (a[key] > b[key]) return order === 'asc' ? 1 : -1
      return 0
    })
  },
}
