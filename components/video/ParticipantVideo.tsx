'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { 
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { Mic, Video, MicOff, VideoOff } from 'lucide-react'

interface ParticipantVideoProps {
  participant: {
    id: string
    name: string
    stream?: MediaStream
    isCameraOn: boolean
    isMicOn: boolean
    isScreenSharing: boolean
  }
  isLocal?: boolean
  isSpeaking?: boolean
  className?: string
}

export function ParticipantVideo({ 
  participant, 
  isLocal = false, 
  isSpeaking = false,
  className = ''
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good')

  // Audio level detection
  const setupAudioAnalysis = useCallback(() => {
    if (!participant.stream || isLocal) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(participant.stream)
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average)
        }
        requestAnimationFrame(updateAudioLevel)
      }
      
      updateAudioLevel()
    } catch (error) {
      console.error('Error setting up audio analysis:', error)
    }
  }, [participant.stream, isLocal])

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream
      setupAudioAnalysis()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [participant.stream, setupAudioAnalysis])

  const isCurrentlySpeaking = isSpeaking || audioLevel > 30

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-900 ${className}`}>
      {/* Video Element */}
      {participant.stream && participant.isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        // Avatar placeholder when camera is off
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="text-center text-white">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto transition-all duration-200 ${
              isCurrentlySpeaking ? 'ring-4 ring-green-400 ring-opacity-75 scale-110' : ''
            }`}>
              <span className="text-xl sm:text-2xl font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium">{participant.name}</p>
          </div>
        </div>
      )}

      {/* Speaking indicator */}
      {isCurrentlySpeaking && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none animate-pulse" />
      )}

      {/* Audio level indicator */}
      {!isLocal && participant.isMicOn && (
        <div className="absolute top-3 right-3">
          <div className={`w-8 h-2 bg-gray-800/80 rounded-full overflow-hidden ${
            isCurrentlySpeaking ? 'ring-2 ring-green-400' : ''
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
              style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Connection quality indicator */}
      <div className="absolute top-3 left-3">
        <div className={`p-1 rounded-full ${
          connectionQuality === 'good' 
            ? 'bg-green-500/80' 
            : connectionQuality === 'medium' 
            ? 'bg-yellow-500/80' 
            : 'bg-red-500/80'
        }`}>
          <SignalIcon className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Participant info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium truncate">
              {participant.name}
              {isLocal && " (You)"}
            </span>
          </div>

          {/* Media status indicators */}
          <div className="flex items-center space-x-1">
            {/* Screen sharing indicator */}
            {participant.isScreenSharing && (
              <div className="bg-blue-500 rounded-full p-1">
                <ComputerDesktopIcon className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Microphone status */}
            <div className={`rounded-full p-1 transition-all duration-200 ${
              participant.isMicOn 
                ? 'bg-green-500' 
                : 'bg-red-500 animate-pulse'
            }`}>
              {participant.isMicOn ? (
                <Mic className="h-3 w-3 text-white" />
              ) : (
                <MicOff className="h-3 w-3 text-white" />
              )}
            </div>

            {/* Camera status */}
            <div className={`rounded-full p-1 transition-all duration-200 ${
              participant.isCameraOn 
                ? 'bg-green-500' 
                : 'bg-red-500 animate-pulse'
            }`}>
              {participant.isCameraOn ? (
                <Video className="h-3 w-3 text-white" />
              ) : (
                <VideoOff className="h-3 w-3 text-white" />
              )}
            </div>

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="bg-green-500 rounded-full p-1 animate-pulse">
                <SpeakerWaveIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera off indicator */}
      {!participant.isCameraOn && (
        <div className="absolute top-3 left-3">
          <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-2 animate-pulse">
            <VideoOff className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}