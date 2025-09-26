'use client'

import { useParams } from 'next/navigation'
import AuthGuard from '@/components/guards/AuthGuard'
import { RoomPage } from '@/components/rooms/RoomPage'

export default function IndividualRoomPage() {
  const params = useParams()
  const roomId = params.id as string

  return (
    <AuthGuard>
      <RoomPage roomId={roomId} />
    </AuthGuard>
  )
}
