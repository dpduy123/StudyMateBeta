import { memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface TimestampProps {
  date: string | Date
  className?: string
  showSuffix?: boolean
}

function TimestampComponent({ date, className = '', showSuffix = true }: TimestampProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return (
    <span className={className}>
      {formatDistanceToNow(dateObj, { 
        addSuffix: showSuffix, 
        locale: vi 
      })}
    </span>
  )
}

export const Timestamp = memo(TimestampComponent)
