// Validation utilities

export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password validation (min 8 chars, 1 uppercase, 1 number)
  isValidPassword: (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  },

  // Username validation (alphanumeric, 3-20 chars)
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  },

  // Number validation
  isValidNumber: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value)
  },

  // Positive number validation
  isPositiveNumber: (value: any): boolean => {
    return validators.isValidNumber(value) && parseFloat(value) > 0
  },

  // Phone number validation (Indonesian format)
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(\+62|0)[0-9]{9,12}$/
    return phoneRegex.test(phone)
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value !== null && value !== undefined
  },

  // Min length validation
  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  // Max length validation
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },
}
