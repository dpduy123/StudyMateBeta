'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/providers/Providers'
import { useVideoCallSignaling } from './useVideoCallSignaling'

export interface Participant {
  id: string
  name: string
  stream?: MediaStream
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
}

export interface VideoCallState {
  participants: Participant[]
  localStream: MediaStream | null
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
  isConnected: boolean
  error: string | null
}

export function useVideoCall(roomId: string) {
  const { user } = useAuth()
  const [state, setState] = useState<VideoCallState>({
    participants: [],
    localStream: null,
    isCameraOn: false,
    isMicOn: false,
    isScreenSharing: false,
    isConnected: false,
    error: null
  })
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      // Start with camera and microphone disabled
      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]
      
      if (videoTrack) videoTrack.enabled = false
      if (audioTrack) audioTrack.enabled = false
      
      setState(prev => ({ 
        ...prev, 
        localStream: stream, 
        isCameraOn: false,
        isMicOn: false,
        error: null 
      }))
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.' 
      }))
      return null
    }
  }, [])

  // Handle signaling messages
  const handleSignalingMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'joinRoom':
        // Will be handled by presence tracking
        break
      case 'leaveRoom':
        // Will be handled by presence tracking  
        break
      case 'userPresence':
        if (message.data.status === 'joined') {
          // User joined - this will trigger peer connection creation
          console.log('User joined via presence:', message.fromUserId)
        } else if (message.data.status === 'left') {
          // User left - remove peer connection
          console.log('User left via presence:', message.fromUserId)
        }
        break
      case 'offer':
        console.log('Received offer from:', message.fromUserId)
        break
      case 'answer':
        console.log('Received answer from:', message.fromUserId)
        break
      case 'iceCandidate':
        console.log('Received ICE candidate from:', message.fromUserId)
        break
      case 'mediaStateChange':
        console.log('Media state change from:', message.fromUserId, message.data)
        break
    }
  }, [])

  // Signaling for WebRTC
  const signaling = useVideoCallSignaling({
    roomId,
    userId: user?.id || '',
    userName: user?.email?.split('@')[0] || 'Anonymous',
    onMessage: handleSignalingMessage
  })

  // Broadcast media state changes
  const broadcastMediaState = useCallback((type: string, enabled: boolean) => {
    signaling.sendMediaStateChange(type, enabled)
  }, [signaling])

  // Toggle camera
  const toggleCamera = useCallback(() => {
    console.log('toggleCamera called, localStream exists:', !!state.localStream)
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0]
      console.log('Video track found:', !!videoTrack, 'current enabled:', videoTrack?.enabled)
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setState(prev => ({ ...prev, isCameraOn: videoTrack.enabled }))
        console.log('Camera toggled to:', videoTrack.enabled)
        
        // Broadcast camera state to other participants
        broadcastMediaState('camera', videoTrack.enabled)
      }
    } else {
      console.log('No local stream available for camera toggle')
    }
  }, [state.localStream, broadcastMediaState])

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    console.log('toggleMicrophone called, localStream exists:', !!state.localStream)
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0]
      console.log('Audio track found:', !!audioTrack, 'current enabled:', audioTrack?.enabled)
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setState(prev => ({ ...prev, isMicOn: audioTrack.enabled }))
        console.log('Microphone toggled to:', audioTrack.enabled)
        
        // Broadcast mic state to other participants
        broadcastMediaState('microphone', audioTrack.enabled)
      }
    } else {
      console.log('No local stream available for microphone toggle')
    }
  }, [state.localStream, broadcastMediaState])

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      // Replace video track with screen share
      if (state.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = Array.from(peerConnections.current.values())
          .flatMap(pc => pc.getSenders())
          .find(s => s.track?.kind === 'video')
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack)
        }
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        
        setState(prev => ({ ...prev, isScreenSharing: true }))
        broadcastMediaState('screenShare', true)
        
        // Listen for screen share end
        videoTrack.onended = () => {
          stopScreenShare()
        }
      }
    } catch (error) {
      console.error('Error starting screen share:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Không thể chia sẻ màn hình' 
      }))
    }
  }, [state.localStream])

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      if (state.localStream) {
        const videoTrack = state.localStream.getVideoTracks()[0]
        const sender = Array.from(peerConnections.current.values())
          .flatMap(pc => pc.getSenders())
          .find(s => s.track?.kind === 'video')
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack)
        }
        
        // Restore camera view
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = state.localStream
        }
        
        setState(prev => ({ ...prev, isScreenSharing: false }))
        broadcastMediaState('screenShare', false)
      }
    } catch (error) {
      console.error('Error stopping screen share:', error)
    }
  }, [state.localStream])

  // Join video call
  const joinCall = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Vui lòng đăng nhập để tham gia cuộc gọi' }))
      return
    }
    
    try {
      setState(prev => ({ ...prev, error: null }))
      const stream = await initializeLocalStream()
      if (!stream) return
      
      // Join room via signaling
      signaling.joinRoom()
      setState(prev => ({ ...prev, isConnected: true }))
    } catch (error) {
      console.error('Error joining call:', error)
      setState(prev => ({ ...prev, error: 'Không thể tham gia cuộc gọi. Vui lòng thử lại.' }))
    }
  }, [user, initializeLocalStream, signaling])

  // Handle user joined
  const handleUserJoined = useCallback(async (userId: string, userName: string) => {
    if (state.localStream && !peerConnections.current.has(userId)) {
      await createPeerConnection(userId, userName, state.localStream, true)
    }
  }, [state.localStream])

  // Handle user left
  const handleUserLeft = useCallback((userId: string) => {
    removePeerConnection(userId)
  }, [])

  // Create peer connection
  const createPeerConnection = useCallback(async (
    peerId: string,
    userName: string,
    localStream: MediaStream, 
    shouldCreateOffer: boolean = false
  ) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // Add TURN servers for production
          // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
        ],
        iceCandidatePoolSize: 10
      })
    
    // Add local stream tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })
    
    // Handle incoming stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === peerId 
            ? { ...p, stream: remoteStream }
            : p
        )
      }))
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendIceCandidate(peerId, event.candidate)
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state change:', pc.connectionState, 'for peer:', peerId)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Attempt to reconnect
        setTimeout(() => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            removePeerConnection(peerId)
          }
        }, 3000)
      }
    }
    
    // Add participant to state if not exists
    setState(prev => {
      const exists = prev.participants.some(p => p.id === peerId)
      if (exists) return prev
      
      return {
        ...prev,
        participants: [...prev.participants, {
          id: peerId,
          name: userName,
          isCameraOn: true,
          isMicOn: true,
          isScreenSharing: false
        }]
      }
    })
    
    peerConnections.current.set(peerId, pc)
    
      if (shouldCreateOffer) {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        signaling.sendOffer(peerId, offer)
      }
      
      return pc
    } catch (error) {
      console.error('Error creating peer connection:', error)
      setState(prev => ({ ...prev, error: 'Lỗi khi tạo kết nối với người dùng khác' }))
      throw error
    }
  }, [signaling])

  // Handle offer
  const handleOffer = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit, localStream: MediaStream) => {
    try {
      let pc = peerConnections.current.get(fromUserId)
      if (!pc) {
        pc = await createPeerConnection(fromUserId, 'Participant', localStream, false)
      }
      
      await pc.setRemoteDescription(offer)
      
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signaling.sendAnswer(fromUserId, answer)
    } catch (error) {
      console.error('Error handling offer:', error)
      setState(prev => ({ ...prev, error: 'Lỗi khi xử lý cuộc gọi đến' }))
    }
  }, [createPeerConnection, signaling])

  // Handle answer
  const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnections.current.get(fromUserId)
      if (pc) {
        await pc.setRemoteDescription(answer)
      }
    } catch (error) {
      console.error('Error handling answer:', error)
      setState(prev => ({ ...prev, error: 'Lỗi khi thiết lập kết nối' }))
    }
  }, [])

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: RTCIceCandidate) => {
    try {
      const pc = peerConnections.current.get(fromUserId)
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(candidate)
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      // Don't set error state for ICE candidate issues as they're usually recoverable
    }
  }, [])

  // Update participant media state
  const updateParticipantMediaState = useCallback((userId: string, mediaType: string, enabled: boolean) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === userId 
          ? { 
              ...p, 
              isCameraOn: mediaType === 'camera' ? enabled : p.isCameraOn,
              isMicOn: mediaType === 'microphone' ? enabled : p.isMicOn,
              isScreenSharing: mediaType === 'screenShare' ? enabled : p.isScreenSharing
            }
          : p
      )
    }))
  }, [])

  // Remove peer connection
  const removePeerConnection = useCallback((peerId: string) => {
    const pc = peerConnections.current.get(peerId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(peerId)
    }
    
    setState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== peerId)
    }))
  }, [])

  // Leave call
  const leaveCall = useCallback(() => {
    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close())
    peerConnections.current.clear()
    
    // Stop local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop())
    }
    
    // Send leave message
    signaling.leaveRoom()
    
    setState({
      participants: [],
      localStream: null,
      isCameraOn: true,
      isMicOn: true,
      isScreenSharing: false,
      isConnected: false,
      error: null
    })
  }, [state.localStream, signaling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall()
    }
  }, [leaveCall])

  return {
    ...state,
    localVideoRef,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare
  }
}