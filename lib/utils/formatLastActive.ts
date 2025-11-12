import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format last active time consistently across the app
 * @param lastActive - ISO date string or Date object
 * @param isOnline - Whether user is currently online
 * @returns Formatted status text
 */
export function formatLastActive(lastActive: string | Date | undefined, isOnline: boolean = false): string {
  // If online, show active status
  if (isOnline) {
    return 'Đang hoạt động'
  }

  // If no lastActive data, show offline
  if (!lastActive) {
    return 'Không hoạt động gần đây'
  }

  const lastActiveDate = typeof lastActive === 'string' ? new Date(lastActive) : lastActive
  const now = new Date()
  const diffMs = now.getTime() - lastActiveDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  // If active within 5 minutes, show as online
  if (diffMins < 5) {
    return 'Đang hoạt động'
  }

  // Use date-fns for consistent formatting
  return formatDistanceToNow(lastActiveDate, {
    addSuffix: true,
    locale: vi
  })
}

/**
 * Format last active time for chat header (with "Hoạt động" prefix for offline users)
 */
export function formatLastActiveForHeader(lastActive: string | Date | undefined, isOnline: boolean = false): string {
  const status = formatLastActive(lastActive, isOnline)
  
  // If already showing "Đang hoạt động" or "Không hoạt động gần đây", return as is
  if (status === 'Đang hoạt động' || status === 'Không hoạt động gần đây') {
    return status
  }
  
  // For offline users, add "Hoạt động" prefix
  return `Hoạt động ${status}`
}
