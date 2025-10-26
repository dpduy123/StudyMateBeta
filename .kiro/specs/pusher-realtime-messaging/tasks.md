# Implementation Plan: Pusher Real-time Messaging

## Overview

This implementation plan breaks down the Pusher integration into discrete, manageable tasks. Each task builds on previous ones to ensure a smooth migration from Socket.IO to Pusher.

---

## Tasks

- [x] 1. Setup Pusher Infrastructure



  - Install Pusher dependencies (pusher and pusher-js packages)
  - Configure environment variables for Pusher credentials
  - Create Pusher server singleton instance in `lib/pusher/server.ts`
  - Create Pusher client singleton instance in `lib/pusher/client.ts`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement Pusher Authentication



  - [x] 2.1 Create authentication API endpoint


    - Create `app/api/pusher/auth/route.ts`
    - Implement POST handler to verify user authentication
    - Validate user has access to requested channel
    - Return Pusher authentication signature
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.2 Add authentication to Pusher client


    - Configure auth endpoint in Pusher client
    - Add Supabase token to auth headers
    - Handle authentication errors
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Create usePusher Hook





  - [x] 3.1 Implement core hook functionality

    - Create `hooks/usePusher.ts` with subscription logic
    - Implement channel subscription with authentication
    - Add event binding and unbinding
    - Handle connection state management
    - Implement cleanup on unmount

    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 3.2 Add error handling and fallback

    - Detect Pusher connection failures
    - Implement polling fallback mechanism
    - Add connection status indicators
    - Log errors for debugging
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 4. Migrate Message Sending


  - [x] 4.1 Update message API to trigger Pusher events


    - Modify `app/api/messages/private/route.ts` POST handler
    - Add Pusher event trigger after saving message
    - Handle Pusher trigger errors gracefully
    - Ensure message is saved even if Pusher fails
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 4.2 Update useRealtimeMessages for sending


    - Modify `sendMessage` function to use API
    - Add optimistic UI updates
    - Handle send errors with user feedback
    - _Requirements: 3.1, 3.2_

- [x] 5. Migrate Message Receiving

  - [ ] 5.1 Subscribe to message channels
    - Update `useRealtimeMessages` to use `usePusher` hook
    - Subscribe to private chat channel on mount
    - Unsubscribe on unmount or chat change
    - _Requirements: 4.1, 4.4_

  - [x] 5.2 Handle incoming message events


    - Bind to 'new-message' event
    - Update local message state when event received
    - Prevent duplicate messages by checking IDs
    - Display messages immediately in UI
    - _Requirements: 4.2, 4.3, 4.5_

- [x] 6. Implement Typing Indicators





  - [x] 6.1 Send typing events


    - Add typing event triggers in message input component
    - Debounce typing events (max 1 per second)
    - Send 'typing-start' when user types
    - Send 'typing-stop' after 3 seconds of inactivity
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 6.2 Display typing indicators


    - Listen for 'typing-start' and 'typing-stop' events
    - Show typing indicator UI when event received
    - Hide indicator on 'typing-stop' event
    - Display user name in typing indicator
    - _Requirements: 5.3, 5.4_

- [x] 7. Implement Read Receipts





  - [x] 7.1 Mark messages as read


    - Create API endpoint to mark message as read
    - Trigger 'message-read' Pusher event after update
    - Only allow receiver to mark messages as read
    - Update database with read status and timestamp
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 7.2 Display read status


    - Listen for 'message-read' events
    - Update message state when read event received
    - Show read indicator (checkmark) in message UI
    - Only show for sender's messages
    - _Requirements: 6.3, 6.4_

- [x] 8. Implement Online/Offline Status





  - [x] 8.1 Setup presence channels


    - Subscribe to presence channel for user
    - Trigger 'user-status-change' event on login
    - Handle automatic offline on browser close
    - Update lastActive timestamp in database
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 8.2 Display user status


    - Listen for 'user-status-change' events
    - Update user status in UI (online/offline indicator)
    - Show last active time for offline users
    - _Requirements: 7.3_


- [x] 9. Implement Message Notifications




  - [x] 9.1 Trigger notification events


    - Send 'message-notification' event when message sent
    - Only send if receiver is not viewing the chat
    - Include sender name and message preview
    - _Requirements: 8.1, 8.4_

  - [x] 9.2 Display browser notifications


    - Request notification permission from user
    - Show browser notification when event received
    - Navigate to chat when notification clicked
    - Respect user notification preferences
    - _Requirements: 8.2, 8.3, 8.5_

- [x] 10. Testing and Quality Assurance





  - [x] 10.1 Test core messaging functionality


    - Test sending messages between two users
    - Verify real-time message delivery
    - Test message persistence in database
    - Verify UI updates correctly
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3_

  - [x] 10.2 Test error scenarios


    - Test behavior when Pusher is unavailable
    - Verify fallback to polling works
    - Test reconnection after network loss
    - Verify error messages display correctly
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 10.3 Test performance


    - Verify message delivery latency < 500ms
    - Test with multiple concurrent users
    - Check for memory leaks in subscriptions
    - Monitor Pusher connection count
    - _Requirements: 11.1, 11.2, 11.5_

- [x] 11. Remove Socket.IO





  - [x] 11.1 Clean up Socket.IO code


    - Remove Socket.IO dependencies from package.json
    - Delete `server.js` custom server file
    - Delete `lib/socket/` directory
    - Delete `pages/api/socket/` directory (if exists)
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 11.2 Update package.json scripts


    - Change `dev` script back to `next dev`
    - Remove custom server references
    - Update build and start scripts
    - _Requirements: 10.3_

  - [x] 11.3 Update documentation


    - Document Pusher setup process
    - Add deployment instructions
    - Update README with new architecture
    - Create migration guide for other developers
    - _Requirements: 10.4, 10.5_

- [ ] 12. Fix Presence and Real-time Updates Issues
  - [ ] 12.1 Fix offline status display issue
    - Debug why users always show as offline despite Pusher presence implementation
    - Verify presence channel subscription is working correctly
    - Check if user presence is being properly tracked in database
    - Ensure presence events are being triggered when users connect/disconnect
    - Test presence status updates in real-time
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 12.2 Fix conversation list not updating with new messages
    - Implement real-time updates for conversation list when new messages arrive
    - Subscribe to message events in ConversationsList component
    - Update last message and unread count when new messages are received
    - Ensure conversation list re-orders based on latest activity
    - Test that conversation preview updates immediately
    - _Requirements: 3.3, 4.2, 4.3, 8.1_

  - [ ] 12.3 Verify and test all real-time features
    - Test presence status updates across multiple browser tabs
    - Verify conversation list updates when messages are sent/received
    - Check that unread counts update correctly
    - Test with multiple users simultaneously
    - Monitor Pusher dashboard for connection and event issues
    - _Requirements: 11.1, 11.2, 11.5_

- [ ] 13. Deployment Preparation
  - [ ] 13.1 Configure environment variables
    - Add Pusher credentials to .env.example
    - Document required environment variables
    - Add variables to deployment platform (Vercel/Railway)
    - _Requirements: 12.2_

  - [ ] 13.2 Test deployment
    - Deploy to staging environment
    - Test all messaging features in staging
    - Monitor Pusher dashboard for errors
    - Verify performance metrics
    - _Requirements: 12.1, 12.4_

  - [ ] 13.3 Production deployment
    - Deploy to production
    - Monitor error rates and performance
    - Have rollback plan ready
    - Document any issues encountered
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

---

## Task Execution Order

### Phase 1: Foundation (Tasks 1-3)
Setup Pusher infrastructure and core hooks. This establishes the foundation for all other features.

### Phase 2: Core Messaging (Tasks 4-5)
Migrate basic message sending and receiving. This is the most critical functionality.

### Phase 3: Enhanced Features (Tasks 6-9)
Add typing indicators, read receipts, status, and notifications. These enhance the user experience.

### Phase 4: Quality & Cleanup (Tasks 10-11)
Test thoroughly and remove Socket.IO code. Ensure stability before deployment.

### Phase 5: Deployment (Task 12)
Deploy to production with monitoring and rollback plan.

---

## Notes

- Each task should be completed and tested before moving to the next
- Keep Socket.IO code until Pusher is fully tested and stable
- Monitor Pusher dashboard during development to track usage
- Test with multiple users/browsers to verify real-time functionality
- Document any issues or deviations from the plan
