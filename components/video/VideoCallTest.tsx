'use client'

import { useState } from 'react'
import { useVideoCall } from '@/hooks/useVideoCall'
import { useAuth } from '@/components/providers/Providers'
import { VideoGrid } from './VideoGrid'
import { 
  VideoCameraIcon,
  PhoneXMarkIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { Mic, Video, MicOff, VideoOff } from 'lucide-react'

interface VideoCallTestProps {
  roomId: string
  onClose?: () => void
}

export function VideoCallTest({ roomId, onClose }: VideoCallTestProps) {
  const { user } = useAuth()
  const [isInCall, setIsInCall] = useState(false)
  
  const {
    participants,
    localStream,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    isConnected,
    error,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare
  } = useVideoCall(roomId)

  const handleJoinCall = async () => {
    setIsInCall(true)
    await joinCall()
  }

  const handleLeaveCall = () => {
    leaveCall()
    setIsInCall(false)
    onClose?.()
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Lỗi cuộc gọi</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!isInCall) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <VideoCameraIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Test Video Call
        </h3>
        <p className="text-gray-600 mb-6">
          Room ID: {roomId}
        </p>
        <button
          onClick={handleJoinCall}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Tham gia cuộc gọi test
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Video Call Test</h2>
            <p className="text-sm text-gray-600">Room: {roomId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            </span>
            <span className="text-sm text-gray-500">
              {participants.length + (localStream ? 1 : 0)} người tham gia
            </span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <VideoGrid
          participants={participants}
          localParticipant={localStream ? {
            id: user?.id || 'local',
            name: user?.email?.split('@')[0] || 'Bạn',
            stream: localStream,
            isCameraOn,
            isMicOn,
            isScreenSharing
          } : undefined}
          className="h-full"
        />
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMicrophone}
            className={`p-3 rounded-full transition-all duration-200 ${
              isMicOn 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105' 
                : 'bg-red-500 hover:bg-red-600 text-white animate-pulse hover:scale-105'
            }`}
            title={isMicOn ? 'Tắt microphone' : 'Bật microphone'}
          >
            {isMicOn ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-all duration-200 ${
              isCameraOn 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105' 
                : 'bg-red-500 hover:bg-red-600 text-white animate-pulse hover:scale-105'
            }`}
            title={isCameraOn ? 'Tắt camera' : 'Bật camera'}
          >
            {isCameraOn ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ComputerDesktopIcon className="h-6 w-6" />
          </button>

          <button
            onClick={handleLeaveCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <PhoneXMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}