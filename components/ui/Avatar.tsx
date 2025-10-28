import { memo } from 'react'

interface AvatarProps {
  src?: string
  alt: string
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl'
}

function AvatarComponent({ src, alt, firstName, lastName, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  // Fallback to initials
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`
  
  return (
    <div className={`${sizeClass} rounded-full bg-primary-500 flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  )
}

export const Avatar = memo(AvatarComponent)
