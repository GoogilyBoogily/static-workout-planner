/**
 * Date formatting utilities for displaying timestamps
 */

/**
 * Format a timestamp as relative time (e.g., "2 hours ago", "3 days ago")
 * @param timestamp - Timestamp in milliseconds (from Date.now())
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) {
    return 'Just now'
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

/**
 * Format a timestamp as absolute date/time (e.g., "Nov 15, 2025 2:30 PM")
 * @param timestamp - Timestamp in milliseconds (from Date.now())
 * @returns Formatted date/time string
 */
export function formatAbsoluteTime(timestamp: number): string {
  const date = new Date(timestamp)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  return date.toLocaleString('en-US', options)
}
