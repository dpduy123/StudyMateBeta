/**
 * Skeleton Loader Components
 * Used only when no cached data is available
 * Requirement: 1 - Initial Page Load Performance
 */

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={{ animationDuration: '1.5s' }}
        />
    )
}

export function ConversationListSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Search skeleton */}
            <div className="p-4 border-b border-gray-200">
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Conversation cards skeleton */}
            <div className="flex-1 overflow-hidden">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="p-4 flex items-center space-x-3 border-b border-gray-100">
                        {/* Avatar skeleton */}
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

                        {/* Content skeleton */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function MessageListSkeleton() {
    return (
        <div className="flex-1 px-4 py-6 space-y-6">
            {Array.from({ length: 6 }).map((_, index) => {
                const isOwn = index % 3 === 0
                return (
                    <div
                        key={index}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar skeleton */}
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />

                        {/* Message bubble skeleton */}
                        <div className={`flex flex-col max-w-xs ${isOwn ? 'items-end' : 'items-start'}`}>
                            {/* Sender name skeleton */}
                            {!isOwn && <Skeleton className="h-3 w-24 mb-1" />}

                            {/* Message content skeleton */}
                            <Skeleton
                                className={`h-16 rounded-2xl ${index % 2 === 0 ? 'w-64' : 'w-48'
                                    }`}
                            />

                            {/* Timestamp skeleton */}
                            <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
