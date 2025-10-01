'use client'

import { ParticipantVideo } from './ParticipantVideo'
import { Participant } from '@/hooks/useVideoCall'

interface VideoGridProps {
  participants: Participant[]
  localParticipant?: Participant
  localVideoRef?: React.RefObject<HTMLVideoElement>
  className?: string
}

export function VideoGrid({ 
  participants, 
  localParticipant,
  className = ''
}: VideoGridProps) {
  const allParticipants = localParticipant 
    ? [localParticipant, ...participants]
    : participants

  const getGridClassName = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  const getVideoClassName = (count: number, isMain: boolean = false) => {
    if (count === 1) return 'aspect-video'
    if (count === 2 && isMain) return 'aspect-video'
    if (count <= 4) return 'aspect-video'
    return 'aspect-video'
  }

  return (
    <div className={`w-full h-full ${className}`}>
      {allParticipants.length === 0 ? (
        // Empty state
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📹</span>
            </div>
            <p className="text-lg font-medium">Đang chờ người tham gia...</p>
            <p className="text-sm">Hãy mời bạn bè tham gia cuộc gọi</p>
          </div>
        </div>
      ) : allParticipants.length === 1 ? (
        // Single participant (full screen)
        <div className="h-full">
          <ParticipantVideo
            participant={allParticipants[0]}
            isLocal={allParticipants[0].id === localParticipant?.id}
            className="w-full h-full"
          />
        </div>
      ) : allParticipants.length === 2 ? (
        // Two participants (side by side on desktop, stacked on mobile)
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {allParticipants.map((participant, index) => (
            <ParticipantVideo
              key={participant.id}
              participant={participant}
              isLocal={participant.id === localParticipant?.id}
              className={getVideoClassName(allParticipants.length, index === 0)}
            />
          ))}
        </div>
      ) : (
        // Multiple participants (grid layout)
        <div className="h-full flex flex-col gap-2 md:gap-4">
          {/* Main speaker (if screen sharing or first participant) */}
          {allParticipants.some(p => p.isScreenSharing) && (
            <div className="flex-1 min-h-0">
              <ParticipantVideo
                participant={allParticipants.find(p => p.isScreenSharing)!}
                isLocal={allParticipants.find(p => p.isScreenSharing)?.id === localParticipant?.id}
                className="w-full h-full"
              />
            </div>
          )}
          
          {/* Grid of other participants */}
          <div className={`
            ${allParticipants.some(p => p.isScreenSharing) ? 'h-32 md:h-40' : 'flex-1'}
            grid gap-2 md:gap-4 ${getGridClassName(
              allParticipants.some(p => p.isScreenSharing) 
                ? allParticipants.filter(p => !p.isScreenSharing).length
                : allParticipants.length
            )}
          `}>
            {allParticipants
              .filter(p => allParticipants.some(sp => sp.isScreenSharing) ? !p.isScreenSharing : true)
              .map((participant) => (
                <ParticipantVideo
                  key={participant.id}
                  participant={participant}
                  isLocal={participant.id === localParticipant?.id}
                  className={getVideoClassName(allParticipants.length)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}