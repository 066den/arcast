/**
 * Date formatting utilities that prevent hydration mismatches
 * by using consistent timezone and locale settings
 */

/**
 * Format a date consistently for display to prevent hydration mismatches
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateConsistent(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return date.toLocaleDateString('en-US', {
    ...options,
    timeZone: 'UTC', // Use UTC to ensure consistency between server and client
  })
}

/**
 * Format a time consistently for display to prevent hydration mismatches
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTimeConsistent(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
): string {
  return date.toLocaleTimeString('en-US', {
    ...options,
    timeZone: 'UTC', // Use UTC to ensure consistency between server and client
  })
}

/**
 * Get a consistent date string for data attributes
 * @param date - The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getConsistentDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'UTC' })
}

/**
 * Get a consistent month name
 * @param date - The date to format
 * @returns Short month name
 */
export function getConsistentMonthName(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
}

/**
 * Get a consistent month name for calendar (with custom abbreviations)
 * @param date - The date to format
 * @returns Short month name with custom abbreviations
 */
export function getCalendarMonthName(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return `${monthNames[month]} ${year}`
}

/**
 * Format a date consistently for Dubai timezone
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Dubai timezone
 */
export function formatDateDubai(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return date.toLocaleDateString('en-US', {
    ...options,
    timeZone: 'Asia/Dubai', // Use Dubai timezone
  })
}

/**
 * Format a time consistently for Dubai timezone
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string in Dubai timezone
 */
export function formatTimeDubai(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
): string {
  return date.toLocaleTimeString('en-US', {
    ...options,
    timeZone: 'Asia/Dubai', // Use Dubai timezone
  })
}
