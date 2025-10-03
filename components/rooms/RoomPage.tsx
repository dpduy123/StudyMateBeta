'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { 
  VideoCameraIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  Mic, 
  Video, 
  MicOff, 
  VideoOff, 
  MonitorUp, 
  Settings, 
  Users, 
  MessageSquare,
  Phone,
  Grid3X3,
  Maximize,
  ChevronRight
} from 'lucide-react'
import { Room } from '@/hooks/useRooms'
import { ChatContainer } from '../chat/ChatContainer'
import { useVideoCall } from '@/hooks/useVideoCall'
import { useRoomMembers } from '@/hooks/useRoomMembers'

interface RoomPageProps {
  roomId: string
}

export function RoomPage({ roomId }: RoomPageProps) {
  const { user } = useAuth()
  
  // Hardcoded mock room data
  const mockRoom: Room = {
    id: roomId,
    name: "Toán Cao Cấp A1 - Ôn thi cuối kỳ",
    description: "Phòng học nhóm ôn tập Toán Cao Cấp A1. Chúng ta sẽ cùng nhau ôn lại các chương về đạo hàm, tích phân và chuỗi số. Mọi người chuẩn bị sẵn tài liệu và bài tập nhé!",
    topic: "Toán Cao Cấp A1",
    type: "study_group",
    maxMembers: 8,
    currentMembers: 5,
    isPrivate: false,
    owner: {
      id: "owner-123",
      name: "Đỗ Phương Duy",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    tags: ["toán", "cao cấp", "ôn thi", "đạo hàm", "tích phân"],
    isMember: true,
    isOwner: false,
    allowVideo: true,
    allowVoice: true,
    allowText: true,
    allowScreenShare: true,
    createdAt: "2024-01-15T10:00:00Z",
    lastActivity: "2024-01-20T15:30:00Z",
    members: [
      {
        id: "member-1",
        name: "Nguyễn Đình Bảo",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        joinedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "member-2", 
        name: "Bùi Ngọc Thiên Thanh",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b589?w=100&h=100&fit=crop&crop=face",
        joinedAt: "2024-01-16T14:30:00Z"
      },
      {
        id: "member-3",
        name: "Đỗ Phương Duy",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", 
        joinedAt: "2024-01-17T09:15:00Z"
      },
      {
        id: "member-4",
        name: "Trần Lê Minh Nhật",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        joinedAt: "2024-01-18T16:45:00Z"
      },
      {
        id: "member-5",
        name: "Nguyễn Huy Bảo",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        joinedAt: "2024-01-19T11:20:00Z"
      }
    ]
  }

  const [room, setRoom] = useState<Room | null>(mockRoom)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(true)
  const [inCall, setInCall] = useState(false)

  // Mock participants data for demo
  const mockParticipants = [
    {
      id: "participant-1",
      name: "Trần Thị Hoa", 
      isCameraOn: true,
      isMicOn: true,
      isScreenSharing: false,
      stream: null as MediaStream | null
    },
    {
      id: "participant-2",
      name: "Lê Văn Đức",
      isCameraOn: false,
      isMicOn: true, 
      isScreenSharing: false,
      stream: null as MediaStream | null
    },
    {
      id: "participant-3", 
      name: "Phạm Thị Mai",
      isCameraOn: true,
      isMicOn: false,
      isScreenSharing: false,
      stream: null as MediaStream | null
    },
    {
      id: "participant-4",
      name: "Hoàng Văn Nam", 
      isCameraOn: true,
      isMicOn: true,
      isScreenSharing: true,
      stream: null as MediaStream | null
    }
  ]

  // Video call functionality - using mock data when in call
  const {
    participants: realParticipants,
    localStream,
    isCameraOn: realIsCameraOn,
    isMicOn: realIsMicOn,
    isScreenSharing: realIsScreenSharing,
    error: callError,
    localVideoRef,
    joinCall: realJoinCall,
    leaveCall: realLeaveCall,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare
  } = useVideoCall(roomId)

  // Use mock data when in call for demo
  const participants = inCall ? mockParticipants : realParticipants
  const isCameraOn = inCall ? true : realIsCameraOn
  const isMicOn = inCall ? true : realIsMicOn  
  const isScreenSharing = inCall ? false : realIsScreenSharing

  // Room members management - using mock data
  const {
    totalMembers: realTotalMembers,
    maxMembers: realMaxMembers,
    isMember: realIsMember,
    joinRoom: realJoinRoom
  } = useRoomMembers(roomId)

  const totalMembers = mockRoom?.currentMembers || realTotalMembers
  const maxMembers = mockRoom?.maxMembers || realMaxMembers
  const isMember = mockRoom?.isMember || realIsMember

  // Handler functions for media controls
  const handleMicrophoneToggle = async () => {
    if (!localStream) {
      console.warn('No local stream available for microphone toggle')
      return
    }
    
    try {
      toggleMicrophone()
    } catch (error) {
      console.error('Error toggling microphone:', error)
      setError('Không thể bật/tắt microphone')
    }
  }

  const handleCameraToggle = async () => {
    if (!localStream) {
      console.warn('No local stream available for camera toggle')
      return
    }
    
    try {
      toggleCamera()
    } catch (error) {
      console.error('Error toggling camera:', error)
      setError('Không thể bật/tắt camera')
    }
  }

  const handleScreenShareToggle = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare()
      } else {
        await startScreenShare()
      }
    } catch (error) {
      console.error('Error toggling screen share:', error)
      setError('Không thể chia sẻ màn hình')
    }
  }

  const handleLeaveCall = () => {
    try {
      realLeaveCall()
      setInCall(false)
    } catch (error) {
      console.error('Error leaving call:', error)
      setError('Không thể rời cuộc gọi')
    }
  }

  const handleJoinCall = async () => {
    if (!isMember) {
      const result = await realJoinRoom()
      if (!result.success) {
        setError('Không thể tham gia phòng')
        return
      }
    }
    
    try {
      setInCall(true)
      // Simulate joining with mock data
      await realJoinCall()
    } catch (error) {
      console.error('Error joining call:', error)
      setError('Không thể tham gia cuộc gọi')
      setInCall(false)
    }
  }

  // Using mock data, no need to fetch from API
  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phòng...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải phòng</h2>
          <p className="text-gray-600 mb-4">{error || 'Phòng không tồn tại'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Show call error if exists
  if (callError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi cuộc gọi</h2>
          <p className="text-gray-600 mb-4">{callError}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => setInCall(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Video Interface */}
      <div className="flex-1 flex relative">
        {/* Primary Video Area */}
        <div className={`flex-1 relative bg-white ${showChat ? 'sm:mr-80' : ''} transition-all duration-300`}>
          {/* Top Control Bar - Mobile Optimized */}
          {inCall && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 px-2">
              <div className="flex items-center justify-center space-x-1 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-2 shadow-lg border border-gray-200 max-w-xs">
                <button
                  onClick={handleMicrophoneToggle}
                  disabled={!localStream}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    !localStream 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : (localStream && isMicOn) 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={
                    !localStream 
                      ? 'Mic không khả dụng' 
                      : (localStream && isMicOn) 
                        ? 'Tắt mic' 
                        : 'Bật mic'
                  }
                >
                  {(localStream && isMicOn) ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={handleCameraToggle}
                  disabled={!localStream}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    !localStream 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : (localStream && isCameraOn) 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={
                    !localStream 
                      ? 'Camera không khả dụng' 
                      : (localStream && isCameraOn) 
                        ? 'Tắt camera' 
                        : 'Bật camera'
                  }
                >
                  {(localStream && isCameraOn) ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </button>

                {/* Hide screen share on mobile to save space */}
                <button
                  onClick={handleScreenShareToggle}
                  disabled={!localStream}
                  className={`hidden sm:block p-2 rounded-lg transition-all duration-200 ${
                    !localStream 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : isScreenSharing 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title={
                    !localStream 
                      ? 'Chia sẻ màn hình không khả dụng' 
                      : isScreenSharing 
                        ? 'Dừng chia sẻ' 
                        : 'Chia sẻ màn hình'
                  }
                >
                  <MonitorUp className="h-4 w-4" />
                </button>

                <button 
                  onClick={handleLeaveCall}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                  title="Rời cuộc gọi"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Top Right Controls - Hide on mobile to avoid overlap */}
          {inCall && (
            <div className="hidden md:block absolute top-6 right-6 z-20">
              <div className="flex items-center space-x-2">
                <button className="p-3 rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 border border-gray-200">
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 border border-gray-200">
                  <Users className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 border border-gray-200">
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 border border-gray-200">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 border border-gray-200">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Main Video Content */}
          <div className="h-full flex flex-col">
            {inCall ? (
              <>
                {/* Central Video Area */}
                <div className="flex-1 flex items-center justify-center">
                  {participants.length === 0 ? (
                    <div className="text-center text-gray-600">
                      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Users className="h-16 w-16 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2 text-gray-800">Đang chờ người tham gia...</h3>
                      <p className="text-gray-500">Hãy mời bạn bè tham gia cuộc gọi</p>
                    </div>
                  ) : (
                    /* Main speaker view - largest participant */
                    <div className="w-full h-full max-w-4xl max-h-[70vh] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                      {participants[0] && (
                        <div className="relative w-full h-full">
                          {participants[0].stream && participants[0].isCameraOn ? (
                            <video
                              ref={(video) => {
                                if (video && participants[0].stream) {
                                  video.srcObject = participants[0].stream;
                                }
                                if (participants[0].id === (user?.id || 'local') && localVideoRef.current) {
                                  localVideoRef.current = video;
                                }
                              }}
                              autoPlay
                              playsInline
                              muted={participants[0].id === (user?.id || 'local')}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                              <div className="text-center text-gray-700">
                                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                  <span className="text-4xl font-bold text-white">
                                    {participants[0].name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <h3 className="text-xl font-medium">{participants[0].name}</h3>
                              </div>
                            </div>
                          )}
                          
                          {/* Participant name overlay */}
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-white/90 rounded-lg px-3 py-1 backdrop-blur-sm border border-gray-200">
                              <span className="text-gray-800 text-sm font-medium">{participants[0].name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Video Tiles - Mobile Optimized */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-2 w-full">
                  <div className="flex items-center justify-center space-x-2 overflow-x-auto">
                    {/* Local user tile */}
                    {localStream && (
                      <div className="relative w-20 h-16 sm:w-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-500 shadow-lg flex-shrink-0">
                        {isCameraOn ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                            <div className="text-center text-gray-700">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {(user?.email?.split('@')[0] || 'You').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Owner label */}
                        <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1">
                          <div className="bg-blue-600 rounded px-1 py-0.5 sm:px-2">
                            <span className="text-white text-xs font-medium">You</span>
                          </div>
                        </div>
                        
                        {/* Mic status */}
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                          <div className={`p-0.5 sm:p-1 rounded ${!isMicOn ? 'bg-red-600' : 'bg-transparent'}`}>
                            {!isMicOn && <MicOff className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other participants tiles - Show only first 2 on mobile, more on desktop */}
                    {participants.slice(1, 4).map((participant, index) => (
                      <div key={participant.id} className="relative w-20 h-16 sm:w-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-lg flex-shrink-0">
                        {participant.stream && participant.isCameraOn ? (
                          <video
                            ref={(video) => {
                              if (video && participant.stream) {
                                video.srcObject = participant.stream
                              }
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                            <div className="text-center text-gray-700">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {participant.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Mic status */}
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                          <div className={`p-0.5 sm:p-1 rounded ${!participant.isMicOn ? 'bg-red-600' : 'bg-transparent'}`}>
                            {!participant.isMicOn && <MicOff className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Room preview when not in call
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-200">
                    <Video className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-800 mb-2">
                    {room?.name}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {room?.description || 'Tham gia cuộc gọi để bắt đầu học tập cùng nhau'}
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleJoinCall}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      {isMember ? 'Tham gia cuộc gọi' : 'Tham gia phòng'}
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      {totalMembers}/{maxMembers} thành viên
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Toggle Button - Mobile optimized position */}
          {inCall && (
            <button
              onClick={() => setShowChat(!showChat)}
              className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 z-10 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/90 hover:bg-gray-50/90 text-gray-600 backdrop-blur-sm transition-all duration-200 shadow-lg border border-gray-200"
              title="Toggle chat"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              {showChat && <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 text-blue-400" />}
            </button>
          )}
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        {showChat && (
          <div className="hidden sm:flex w-80 bg-white border-l border-gray-200 flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Room Info</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Room Information */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <span className="text-gray-800">{room?.topic}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-800 capitalize">{room?.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Participants:</span>
                  <span className="text-gray-800">{totalMembers}/{maxMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Room ID:</span>
                  <span className="text-gray-800 font-mono">{roomId.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Owner:</span>
                  <span className="text-gray-800">{room?.owner.name}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room?.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Participants ({totalMembers})</h4>
              <div className="space-y-2">
                {/* Current user */}
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(user?.email?.split('@')[0] || 'You').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm font-medium">
                      {user?.email?.split('@')[0] || 'You'} (You)
                    </div>
                    <div className="text-gray-500 text-xs">Host</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!isMicOn && <MicOff className="h-3 w-3 text-red-500" />}
                    {!isCameraOn && <VideoOff className="h-3 w-3 text-red-500" />}
                  </div>
                </div>

                {/* Other participants */}
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 text-sm font-medium">{participant.name}</div>
                      <div className="text-gray-500 text-xs">Participant</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!participant.isMicOn && <MicOff className="h-3 w-3 text-red-500" />}
                      {!participant.isCameraOn && <VideoOff className="h-3 w-3 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-800">Chat</h4>
              </div>
              <div className="flex-1 min-h-0">
                <ChatContainer
                  chatId={roomId}
                  chatType="room"
                  currentUserId={user?.id || ''}
                  title=""
                  className="h-full bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Chat Overlay */}
        {showChat && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowChat(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Room Info</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile Room Information */}
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subject:</span>
                    <span className="text-gray-800">{room?.topic}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Participants:</span>
                    <span className="text-gray-800">{totalMembers}/{maxMembers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Owner:</span>
                    <span className="text-gray-800">{room?.owner.name}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Participants List */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Participants ({totalMembers})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {/* Current user */}
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(user?.email?.split('@')[0] || 'You').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 text-sm font-medium">
                        {user?.email?.split('@')[0] || 'You'} (You)
                      </div>
                      <div className="text-gray-500 text-xs">Host</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!isMicOn && <MicOff className="h-3 w-3 text-red-500" />}
                      {!isCameraOn && <VideoOff className="h-3 w-3 text-red-500" />}
                    </div>
                  </div>

                  {/* Other participants */}
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-800 text-sm font-medium">{participant.name}</div>
                        <div className="text-gray-500 text-xs">Participant</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!participant.isMicOn && <MicOff className="h-3 w-3 text-red-500" />}
                        {!participant.isCameraOn && <VideoOff className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Chat Section */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">Chat</h4>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatContainer
                    chatId={roomId}
                    chatType="room"
                    currentUserId={user?.id || ''}
                    title=""
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
