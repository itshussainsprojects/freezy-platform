// Utility functions for handling dates from Firebase and fallback data

/**
 * Safely converts Firebase Timestamp or regular Date to JavaScript Date
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @returns Date object or null
 */
export const safeToDate = (dateValue: any): Date | null => {
  if (!dateValue) return null
  
  // If it's a Firebase Timestamp with toDate method
  if (dateValue.toDate && typeof dateValue.toDate === 'function') {
    return dateValue.toDate()
  }
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue
  }
  
  // If it's a string or number, try to parse it
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const parsed = new Date(dateValue)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  
  return null
}

/**
 * Safely formats a date for display
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string
 */
export const formatDate = (dateValue: any, fallback: string = 'Unknown'): string => {
  const date = safeToDate(dateValue)
  return date ? date.toLocaleDateString() : fallback
}

/**
 * Safely formats a date with time for display
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateValue: any, fallback: string = 'Unknown'): string => {
  const date = safeToDate(dateValue)
  return date ? date.toLocaleString() : fallback
}

/**
 * Gets relative time (e.g., "2 hours ago", "3 days ago")
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @param fallback - Fallback text if date is invalid
 * @returns Relative time string
 */
export const getRelativeTime = (dateValue: any, fallback: string = 'Unknown'): string => {
  const date = safeToDate(dateValue)
  if (!date) return fallback
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
  
  const years = Math.floor(diffInDays / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

/**
 * Checks if a date is today
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @returns boolean
 */
export const isToday = (dateValue: any): boolean => {
  const date = safeToDate(dateValue)
  if (!date) return false
  
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Checks if a date is yesterday
 * @param dateValue - Firebase Timestamp, Date object, or string
 * @returns boolean
 */
export const isYesterday = (dateValue: any): boolean => {
  const date = safeToDate(dateValue)
  if (!date) return false
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}
