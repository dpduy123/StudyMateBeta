import Pusher from 'pusher'

// Singleton Pusher server instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

/**
 * Trigger a Pusher event on a channel
 * @param channel - Channel name (e.g., "private-chat-user1-user2")
 * @param event - Event name (e.g., "new-message")
 * @param data - Event payload
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  try {
    await pusherServer.trigger(channel, event, data)
    console.log(`✅ Pusher event triggered: ${event} on ${channel}`)
  } catch (error) {
    console.error(`❌ Failed to trigger Pusher event: ${event}`, error)
    // Don't throw - allow the application to continue even if Pusher fails
  }
}

/**
 * Authenticate a user for a private channel
 * @param socketId - Pusher socket ID from client
 * @param channel - Channel name to authenticate
 * @param userId - User ID to authorize
 * @returns Authentication signature
 */
export function authenticateChannel(
  socketId: string,
  channel: string,
  userId: string
): { auth: string } {
  // Verify user has access to this channel
  // For private-chat channels, user must be part of the chat
  if (channel.startsWith('private-chat-')) {
    // Channel format: private-chat-{uuid1}-{uuid2}
    // UUIDs contain dashes, so we need to extract them properly
    const channelContent = channel.replace('private-chat-', '')
    // Check if the user ID appears in the channel name
    if (!channelContent.includes(userId)) {
      throw new Error('User not authorized for this channel')
    }
  }

  // For private-notifications channels, user must match
  if (channel.startsWith('private-notifications-')) {
    const channelUserId = channel.replace('private-notifications-', '')
    if (channelUserId !== userId) {
      throw new Error('User not authorized for this channel')
    }
  }

  // Generate auth signature
  const auth = pusherServer.authorizeChannel(socketId, channel)
  return auth
}

/**
 * Authenticate a user for a presence channel
 * @param socketId - Pusher socket ID from client
 * @param channel - Presence channel name
 * @param userId - User ID
 * @param userInfo - User information to share with other channel members
 * @returns Authentication signature with user data
 */
export function authenticatePresenceChannel(
  socketId: string,
  channel: string,
  userId: string,
  userInfo: { name: string; avatar?: string }
) {
  // For presence-user-{userId} channels:
  // - If subscribing to own channel, join as a member (with user data)
  // - If subscribing to someone else's channel, join as observer (no user data)
  if (channel.startsWith('presence-user-')) {
    const channelUserId = channel.replace('presence-user-', '')

    // If user is subscribing to their own presence channel, include their data
    if (channelUserId === userId) {
      const presenceData = {
        user_id: userId,
        user_info: userInfo
      }
      const auth = pusherServer.authorizeChannel(socketId, channel, presenceData)
      return auth
    }

    // If user is subscribing to someone else's presence channel (to watch their status),
    // allow it but don't add them as a visible member
    // Use a different user_id to avoid showing up in the member list
    const observerData = {
      user_id: `observer-${userId}`,
      user_info: { name: 'Observer', avatar: undefined }
    }
    const auth = pusherServer.authorizeChannel(socketId, channel, observerData)
    return auth
  }

  // For other presence channels, use standard presence data
  const presenceData = {
    user_id: userId,
    user_info: userInfo
  }

  const auth = pusherServer.authorizeChannel(socketId, channel, presenceData)
  return auth
}

/**
 * Get channel name for a private chat between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Channel name in format "private-chat-{sorted-user-ids}"
 */
export function getChatChannelName(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort()
  return `private-chat-${sortedIds[0]}-${sortedIds[1]}`
}

/**
 * Get channel name for user notifications
 * @param userId - User ID
 * @returns Channel name in format "private-notifications-{userId}"
 */
export function getNotificationChannelName(userId: string): string {
  return `private-notifications-${userId}`
}

/**
 * Get channel name for user presence
 * @param userId - User ID
 * @returns Channel name in format "presence-user-{userId}"
 */
export function getPresenceChannelName(userId: string): string {
  return `presence-user-${userId}`
}
