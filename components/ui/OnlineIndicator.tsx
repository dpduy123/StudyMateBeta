import { memo } from 'react'

interface OnlineIndicatorProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
}

function OnlineIndicatorComponent({ isOnline, size = 'md', className = '' }: OnlineIndicatorProps) {
  if (!isOnline) return null

  const sizeClass = sizeClasses[size]
  
  return (
    <div 
      className={`${sizeClass} bg-green-500 border-2 border-white rounded-full ${className}`}
      aria-label="Online"
    />
  )
}

export const OnlineIndicator = memo(OnlineIndicatorComponent)
