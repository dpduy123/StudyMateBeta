# Requirements Document: Pusher Real-time Messaging

## Introduction

This specification outlines the implementation of real-time messaging functionality using Pusher as a replacement for the current Socket.IO implementation. The goal is to provide a stable, scalable, and production-ready real-time messaging system that works seamlessly with Next.js App Router and can be deployed on any platform including Vercel.

## Glossary

- **Pusher**: A hosted service that provides real-time messaging infrastructure via WebSockets and HTTP fallback
- **Channel**: A Pusher concept representing a communication pathway for events (e.g., private-chat-{userId1}-{userId2})
- **Event**: A message or notification sent through a Pusher channel
- **Private Channel**: A Pusher channel that requires authentication to subscribe
- **Presence Channel**: A Pusher channel that tracks which users are currently subscribed
- **Client**: The browser-side Pusher client library (pusher-js)
- **Server**: The server-side Pusher library (pusher) used in API routes
- **Message**: A text or file communication between users
- **Real-time**: Events delivered to clients within 100-500ms of occurrence

## Requirements

### Requirement 1: Pusher Setup and Configuration

**User Story:** As a developer, I want to set up Pusher in the application so that I can replace Socket.IO with a more stable solution.

#### Acceptance Criteria

1. WHEN the developer installs Pusher dependencies, THE System SHALL install both `pusher` (server) and `pusher-js` (client) packages
2. WHEN the developer configures environment variables, THE System SHALL require `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER` variables
3. WHEN the application initializes Pusher server instance, THE System SHALL create a singleton instance in `lib/pusher/server.ts`
4. WHEN the application initializes Pusher client instance, THE System SHALL create a client instance in `lib/pusher/client.ts`
5. WHERE the application runs in production, THE System SHALL use encrypted connections (TLS)

### Requirement 2: Private Channel Authentication

**User Story:** As a user, I want my private messages to be secure so that only authorized users can access them.

#### Acceptance Criteria

1. WHEN a user subscribes to a private channel, THE System SHALL verify the user's authentication token
2. WHEN authentication is successful, THE System SHALL return a valid channel authorization signature
3. IF authentication fails, THEN THE System SHALL return a 403 Forbidden error
4. WHEN a user subscribes to a private chat channel, THE System SHALL verify that the user is either the sender or receiver
5. THE System SHALL create an API endpoint at `/api/pusher/auth` for channel authentication

### Requirement 3: Send Private Messages

**User Story:** As a user, I want to send private messages to other users so that I can communicate in real-time.

#### Acceptance Criteria

1. WHEN a user sends a message, THE System SHALL save the message to the database
2. WHEN the message is saved successfully, THE System SHALL trigger a Pusher event on the private chat channel
3. THE System SHALL send the event with type `new-message` containing the complete message object
4. WHEN the receiver is subscribed to the channel, THE System SHALL deliver the message within 500ms
5. IF the Pusher event fails, THE System SHALL still return success to the sender (message is saved)

### Requirement 4: Receive Private Messages

**User Story:** As a user, I want to receive messages in real-time so that I can have instant conversations.

#### Acceptance Criteria

1. WHEN a user opens a chat, THE System SHALL subscribe to the private chat channel
2. WHEN a new message event is received, THE System SHALL add the message to the local state
3. WHEN a message is received, THE System SHALL display it immediately without page refresh
4. WHEN the user leaves the chat, THE System SHALL unsubscribe from the channel
5. THE System SHALL prevent duplicate messages by checking message IDs

### Requirement 5: Typing Indicators

**User Story:** As a user, I want to see when someone is typing so that I know they are composing a response.

#### Acceptance Criteria

1. WHEN a user starts typing, THE System SHALL trigger a `typing-start` event on the chat channel
2. WHEN a user stops typing for 3 seconds, THE System SHALL trigger a `typing-stop` event
3. WHEN a typing event is received, THE System SHALL display a typing indicator for that user
4. WHEN a typing-stop event is received, THE System SHALL hide the typing indicator
5. THE System SHALL not send typing events more frequently than once per second

### Requirement 6: Read Receipts

**User Story:** As a user, I want to know when my messages have been read so that I can confirm the recipient saw them.

#### Acceptance Criteria

1. WHEN a user views a message, THE System SHALL mark the message as read in the database
2. WHEN a message is marked as read, THE System SHALL trigger a `message-read` event
3. WHEN the sender receives a message-read event, THE System SHALL update the message status in the UI
4. THE System SHALL display a read indicator (e.g., checkmark) for read messages
5. THE System SHALL only allow the receiver to mark messages as read

### Requirement 7: Online/Offline Status

**User Story:** As a user, I want to see which users are online so that I know who is available to chat.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL subscribe to a presence channel for their user ID
2. WHEN a user's presence changes, THE System SHALL trigger a `user-status-change` event
3. WHEN a status change event is received, THE System SHALL update the user's online status in the UI
4. WHEN a user closes the browser, THE System SHALL automatically mark them as offline
5. THE System SHALL update the user's `lastActive` timestamp in the database

### Requirement 8: Message Notifications

**User Story:** As a user, I want to receive notifications for new messages so that I don't miss important communications.

#### Acceptance Criteria

1. WHEN a user receives a message while not viewing the chat, THE System SHALL trigger a `message-notification` event
2. WHEN a notification event is received, THE System SHALL display a browser notification (if permitted)
3. WHEN a notification is clicked, THE System SHALL navigate to the relevant chat
4. THE System SHALL include sender name and message preview in the notification
5. THE System SHALL respect the user's notification preferences

### Requirement 9: Error Handling and Fallback

**User Story:** As a user, I want the messaging system to work reliably even if real-time features fail.

#### Acceptance Criteria

1. WHEN Pusher connection fails, THE System SHALL log the error and continue using API fallback
2. WHEN a Pusher event fails to send, THE System SHALL not throw an error to the user
3. WHEN the user is offline, THE System SHALL queue messages and send them when reconnected
4. THE System SHALL display connection status to the user (connected/disconnected)
5. IF Pusher is unavailable, THE System SHALL fall back to polling every 5 seconds

### Requirement 10: Migration from Socket.IO

**User Story:** As a developer, I want to migrate from Socket.IO to Pusher so that the system is more stable and deployable.

#### Acceptance Criteria

1. WHEN the migration is complete, THE System SHALL remove all Socket.IO dependencies
2. WHEN the migration is complete, THE System SHALL remove the custom server.js file
3. WHEN the migration is complete, THE System SHALL update package.json to use standard Next.js dev command
4. THE System SHALL maintain backward compatibility with existing message data
5. THE System SHALL provide migration documentation for deployment

### Requirement 11: Performance and Scalability

**User Story:** As a system administrator, I want the messaging system to handle many concurrent users efficiently.

#### Acceptance Criteria

1. THE System SHALL support at least 100 concurrent connections on Pusher free tier
2. WHEN sending a message, THE System SHALL complete the operation within 1 second
3. THE System SHALL batch database queries to minimize latency
4. THE System SHALL use Pusher's built-in connection management for reconnection
5. THE System SHALL not create memory leaks from unclosed subscriptions

### Requirement 12: Deployment Compatibility

**User Story:** As a developer, I want to deploy the application on Vercel so that I can use serverless infrastructure.

#### Acceptance Criteria

1. WHEN deployed on Vercel, THE System SHALL work without custom server configuration
2. WHEN deployed on any platform, THE System SHALL only require environment variables
3. THE System SHALL not depend on long-running server processes
4. THE System SHALL work with Next.js App Router serverless functions
5. THE System SHALL provide deployment instructions for Vercel, Railway, and VPS

---

## Non-Functional Requirements

### Security
- All Pusher channels must use authentication
- API keys must be stored in environment variables
- Private channels must verify user authorization

### Performance
- Message delivery latency < 500ms
- API response time < 1 second
- No memory leaks from subscriptions

### Reliability
- Graceful degradation when Pusher is unavailable
- Automatic reconnection on connection loss
- Message persistence in database

### Maintainability
- Clear separation between Pusher client and server code
- Comprehensive error logging
- Easy to switch back to Socket.IO if needed

### Scalability
- Support for Pusher free tier (100 connections)
- Easy upgrade path to paid tiers
- Efficient channel management
