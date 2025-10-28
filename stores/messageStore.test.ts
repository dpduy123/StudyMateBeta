import { describe, it, expect, beforeEach } from 'vitest'
import { useMessageStore, Message, Conversation } from './messageStore'

describe('MessageStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useMessageStore.getState().clearStore()
  })

  // ==================== Conversation State Management Tests ====================

  describe('Conversation State Management', () => {
    const mockConversation: Conversation = {
      id: 'conv-1',
      otherUser: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isOnline: true,
      },
      unreadCount: 2,
      lastActivity: new Date().toISOString(),
      _cached: true,
      _lastSync: new Date().toISOString(),
      _prefetched: false,
    }

    it('should set conversations', () => {
      const { setConversations, conversations } = useMessageStore.getState()
      
      setConversations([mockConversation])
      
      const state = useMessageStore.getState()
      expect(state.conversations.size).toBe(1)
      expect(state.conversations.get('conv-1')).toEqual(mockConversation)
    })

    it('should update a conversation', () => {
      const { setConversations, updateConversation } = useMessageStore.getState()
      
      setConversations([mockConversation])
      updateConversation('conv-1', { unreadCount: 5 })
      
      const state = useMessageStore.getState()
      const updated = state.conversations.get('conv-1')
      expect(updated?.unreadCount).toBe(5)
      expect(updated?.otherUser.firstName).toBe('John') // Other fields unchanged
    })

    it('should select a conversation', () => {
      const { selectConversation } = useMessageStore.getState()
      
      selectConversation('conv-1')
      
      const state = useMessageStore.getState()
      expect(state.selectedConversationId).toBe('conv-1')
    })

    it('should deselect a conversation', () => {
      const { selectConversation } = useMessageStore.getState()
      
      selectConversation('conv-1')
      selectConversation(null)
      
      const state = useMessageStore.getState()
      expect(state.selectedConversationId).toBeNull()
    })
  })

  // ==================== Message State Management Tests ====================

  describe('Message State Management', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      type: 'TEXT',
      content: 'Hello, this is a test message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
      },
    }

    it('should set messages for a conversation', () => {
      const { setMessages } = useMessageStore.getState()
      
      setMessages('conv-1', [mockMessage])
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1)
      expect(messages?.[0].id).toBe('msg-1')
    })

    it('should add a message to a conversation', () => {
      const { addMessage } = useMessageStore.getState()
      
      addMessage('conv-1', mockMessage)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1)
      expect(messages?.[0].content).toBe('Hello, this is a test message')
    })

    it('should deduplicate messages when adding', () => {
      const { addMessage } = useMessageStore.getState()
      
      addMessage('conv-1', mockMessage)
      addMessage('conv-1', mockMessage) // Add same message again
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1) // Should only have one message
    })

    it('should sort messages by createdAt when adding', () => {
      const { addMessage } = useMessageStore.getState()
      
      const msg1: Message = {
        ...mockMessage,
        id: 'msg-1',
        createdAt: '2024-01-02T10:00:00Z',
      }
      
      const msg2: Message = {
        ...mockMessage,
        id: 'msg-2',
        createdAt: '2024-01-01T10:00:00Z',
      }
      
      addMessage('conv-1', msg1)
      addMessage('conv-1', msg2)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages?.[0].id).toBe('msg-2') // Earlier message first
      expect(messages?.[1].id).toBe('msg-1')
    })

    it('should update a message', () => {
      const { addMessage, updateMessage } = useMessageStore.getState()
      
      addMessage('conv-1', mockMessage)
      updateMessage('conv-1', 'msg-1', {
        content: 'Updated message',
        isEdited: true,
      })
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages?.[0].content).toBe('Updated message')
      expect(messages?.[0].isEdited).toBe(true)
    })

    it('should delete a message', () => {
      const { addMessage, deleteMessage } = useMessageStore.getState()
      
      addMessage('conv-1', mockMessage)
      deleteMessage('conv-1', 'msg-1')
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(0)
    })
  })

  // ==================== Optimistic Update Tests ====================

  describe('Optimistic Updates', () => {
    const senderInfo = {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
    }

    it('should create optimistic message with pending status', () => {
      const { sendMessageOptimistic } = useMessageStore.getState()
      
      const operationId = sendMessageOptimistic('conv-1', 'Hello!', 'user-1', senderInfo)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1)
      
      const message = messages?.[0]
      expect(message?._optimistic).toBe(true)
      expect(message?._status).toBe('pending')
      expect(message?._operationId).toBe(operationId)
      expect(message?.content).toBe('Hello!')
    })

    it('should confirm optimistic message with server data', () => {
      const { sendMessageOptimistic, confirmMessage } = useMessageStore.getState()
      
      const operationId = sendMessageOptimistic('conv-1', 'Hello!', 'user-1', senderInfo)
      
      const serverMessage: Message = {
        id: 'msg-server-1',
        senderId: 'user-1',
        receiverId: 'conv-1',
        type: 'TEXT',
        content: 'Hello!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: senderInfo,
      }
      
      confirmMessage('conv-1', operationId, serverMessage)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1)
      
      const message = messages?.[0]
      expect(message?.id).toBe('msg-server-1')
      expect(message?._optimistic).toBeUndefined()
      expect(message?._status).toBeUndefined()
      expect(message?._operationId).toBeUndefined()
    })

    it('should rollback optimistic message on failure', () => {
      const { sendMessageOptimistic, rollbackMessage } = useMessageStore.getState()
      
      const operationId = sendMessageOptimistic('conv-1', 'Hello!', 'user-1', senderInfo)
      
      rollbackMessage('conv-1', operationId)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1)
      
      const message = messages?.[0]
      expect(message?._status).toBe('failed')
    })

    it('should deduplicate when confirming if server message already exists', () => {
      const { sendMessageOptimistic, addMessage, confirmMessage } = useMessageStore.getState()
      
      const operationId = sendMessageOptimistic('conv-1', 'Hello!', 'user-1', senderInfo)
      
      const serverMessage: Message = {
        id: 'msg-server-1',
        senderId: 'user-1',
        receiverId: 'conv-1',
        type: 'TEXT',
        content: 'Hello!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: senderInfo,
      }
      
      // Simulate server message arriving via Pusher before confirmation
      addMessage('conv-1', serverMessage)
      
      // Now confirm the optimistic message
      confirmMessage('conv-1', operationId, serverMessage)
      
      const state = useMessageStore.getState()
      const messages = state.messages.get('conv-1')
      expect(messages).toHaveLength(1) // Should only have one message, not duplicate
      expect(messages?.[0].id).toBe('msg-server-1')
    })
  })

  // ==================== Typing Indicators Tests ====================

  describe('Typing Indicators', () => {
    const typingUser = {
      userId: 'user-1',
      userName: 'John Doe',
    }

    it('should set typing users for a conversation', () => {
      const { setTypingUsers } = useMessageStore.getState()
      
      setTypingUsers('conv-1', [typingUser])
      
      const state = useMessageStore.getState()
      const typing = state.typingUsers.get('conv-1')
      expect(typing).toHaveLength(1)
      expect(typing?.[0].userId).toBe('user-1')
    })

    it('should add a typing user', () => {
      const { addTypingUser } = useMessageStore.getState()
      
      addTypingUser('conv-1', typingUser)
      
      const state = useMessageStore.getState()
      const typing = state.typingUsers.get('conv-1')
      expect(typing).toHaveLength(1)
      expect(typing?.[0].userName).toBe('John Doe')
    })

    it('should not add duplicate typing user', () => {
      const { addTypingUser } = useMessageStore.getState()
      
      addTypingUser('conv-1', typingUser)
      addTypingUser('conv-1', typingUser) // Add same user again
      
      const state = useMessageStore.getState()
      const typing = state.typingUsers.get('conv-1')
      expect(typing).toHaveLength(1) // Should only have one user
    })

    it('should remove a typing user', () => {
      const { addTypingUser, removeTypingUser } = useMessageStore.getState()
      
      addTypingUser('conv-1', typingUser)
      removeTypingUser('conv-1', 'user-1')
      
      const state = useMessageStore.getState()
      const typing = state.typingUsers.get('conv-1')
      expect(typing).toHaveLength(0)
    })
  })

  // ==================== Store Utility Tests ====================

  describe('Store Utilities', () => {
    it('should clear entire store', () => {
      const {
        setConversations,
        addMessage,
        selectConversation,
        addTypingUser,
        clearStore,
      } = useMessageStore.getState()
      
      // Add some data
      setConversations([
        {
          id: 'conv-1',
          otherUser: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true,
          },
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
        },
      ])
      
      addMessage('conv-1', {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        type: 'TEXT',
        content: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      })
      
      selectConversation('conv-1')
      addTypingUser('conv-1', { userId: 'user-1', userName: 'John' })
      
      // Clear store
      clearStore()
      
      const state = useMessageStore.getState()
      expect(state.conversations.size).toBe(0)
      expect(state.messages.size).toBe(0)
      expect(state.selectedConversationId).toBeNull()
      expect(state.typingUsers.size).toBe(0)
    })
  })
})
