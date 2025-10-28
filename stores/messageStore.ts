import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
export interface Message {
  id: string
  senderId: string
  receiverId?: string
  roomId?: string
  type: 'TEXT' | 'FILE' | 'VOICE' | 'VIDEO'
  content: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
  isEdited?: boolean
  editedAt?: string
  isRead?: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  replyTo?: Message
  reactions?: MessageReaction[]
  
  // Optimistic update metadata
  _optimistic?: boolean
  _operationId?: string
  _status?: 'pending' | 'confirmed' | 'failed'
  
  // Cache metadata
  _cached?: boolean
}

export interface MessageReaction {
  emoji: string
  users: {
    id: string
    firstName: string
    lastName: string
  }[]
  count: number
}

export interface Conversation {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    isOnline: boolean
    lastActive?: string
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    senderId: string
    isRead: boolean
  }
  unreadCount: number
  lastActivity: string
  
  // Cache metadata
  _cached?: boolean
  _lastSync?: string
  _prefetched?: boolean
}

export interface TypingUser {
  userId: string
  userName: string
}

interface MessageStore {
  // State
  conversations: Map<string, Conversation>
  messages: Map<string, Message[]>
  selectedConversationId: string | null
  typingUsers: Map<string, TypingUser[]>
  
  // Conversation actions
  setConversations: (conversations: Conversation[]) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  selectConversation: (id: string | null) => void
  
  // Message actions
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  
  // Optimistic update actions
  sendMessageOptimistic: (conversationId: string, content: string, senderId: string, senderInfo: Message['sender']) => string
  confirmMessage: (conversationId: string, tempId: string, serverMessage: Message) => void
  rollbackMessage: (conversationId: string, operationId: string) => void
  
  // Typing indicators
  setTypingUsers: (conversationId: string, users: TypingUser[]) => void
  addTypingUser: (conversationId: string, user: TypingUser) => void
  removeTypingUser: (conversationId: string, userId: string) => void
  
  // Utility actions
  clearStore: () => void
}

export const useMessageStore = create<MessageStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      conversations: new Map(),
      messages: new Map(),
      selectedConversationId: null,
      typingUsers: new Map(),
      
      // Conversation actions
      setConversations: (conversations) => {
        set((state) => {
          const newConversations = new Map(state.conversations)
          conversations.forEach(conv => {
            newConversations.set(conv.id, conv)
          })
          return { conversations: newConversations }
        }, false, 'setConversations')
      },
      
      updateConversation: (id, updates) => {
        set((state) => {
          const newConversations = new Map(state.conversations)
          const existing = newConversations.get(id)
          if (existing) {
            newConversations.set(id, { ...existing, ...updates })
          }
          return { conversations: newConversations }
        }, false, 'updateConversation')
      },
      
      selectConversation: (id) => {
        set({ selectedConversationId: id }, false, 'selectConversation')
      },
      
      // Message actions
      setMessages: (conversationId, messages) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          newMessages.set(conversationId, messages)
          return { messages: newMessages }
        }, false, 'setMessages')
      },
      
      addMessage: (conversationId, message) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          const conversationMessages = newMessages.get(conversationId) || []
          
          // Message deduplication - check if message already exists
          const existingIndex = conversationMessages.findIndex(m => m.id === message.id)
          if (existingIndex !== -1) {
            // Message already exists, don't add duplicate
            return state
          }
          
          // Add new message and sort by createdAt
          const updatedMessages = [...conversationMessages, message].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          
          newMessages.set(conversationId, updatedMessages)
          return { messages: newMessages }
        }, false, 'addMessage')
      },
      
      updateMessage: (conversationId, messageId, updates) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          const conversationMessages = newMessages.get(conversationId) || []
          
          const updatedMessages = conversationMessages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
          
          newMessages.set(conversationId, updatedMessages)
          return { messages: newMessages }
        }, false, 'updateMessage')
      },
      
      deleteMessage: (conversationId, messageId) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          const conversationMessages = newMessages.get(conversationId) || []
          
          const updatedMessages = conversationMessages.filter(msg => msg.id !== messageId)
          
          newMessages.set(conversationId, updatedMessages)
          return { messages: newMessages }
        }, false, 'deleteMessage')
      },
      
      // Optimistic update actions
      sendMessageOptimistic: (conversationId, content, senderId, senderInfo) => {
        const operationId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const tempMessage: Message = {
          id: operationId,
          senderId,
          receiverId: conversationId,
          type: 'TEXT',
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: senderInfo,
          _optimistic: true,
          _operationId: operationId,
          _status: 'pending'
        }
        
        // Add optimistic message to store
        get().addMessage(conversationId, tempMessage)
        
        return operationId
      },
      
      confirmMessage: (conversationId, tempId, serverMessage) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          const conversationMessages = newMessages.get(conversationId) || []
          
          // Find and replace the temporary message with the server message
          const updatedMessages = conversationMessages.map(msg => {
            if (msg.id === tempId || msg._operationId === tempId) {
              // Replace with server message, removing optimistic flags
              const { _optimistic, _operationId, _status, ...cleanServerMessage } = serverMessage
              return cleanServerMessage
            }
            return msg
          })
          
          // Remove any duplicates (in case server message was already added via Pusher)
          const deduplicatedMessages = updatedMessages.filter((msg, index, self) =>
            index === self.findIndex(m => m.id === msg.id)
          )
          
          newMessages.set(conversationId, deduplicatedMessages)
          return { messages: newMessages }
        }, false, 'confirmMessage')
      },
      
      rollbackMessage: (conversationId, operationId) => {
        set((state) => {
          const newMessages = new Map(state.messages)
          const conversationMessages = newMessages.get(conversationId) || []
          
          // Update message status to 'failed' instead of removing it
          // This allows user to retry
          const updatedMessages = conversationMessages.map(msg => {
            if (msg.id === operationId || msg._operationId === operationId) {
              return { ...msg, _status: 'failed' as const }
            }
            return msg
          })
          
          newMessages.set(conversationId, updatedMessages)
          return { messages: newMessages }
        }, false, 'rollbackMessage')
      },
      
      // Typing indicators
      setTypingUsers: (conversationId, users) => {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers)
          newTypingUsers.set(conversationId, users)
          return { typingUsers: newTypingUsers }
        }, false, 'setTypingUsers')
      },
      
      addTypingUser: (conversationId, user) => {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers)
          const conversationTyping = newTypingUsers.get(conversationId) || []
          
          // Check if user is already in typing list
          if (conversationTyping.find(u => u.userId === user.userId)) {
            return state
          }
          
          newTypingUsers.set(conversationId, [...conversationTyping, user])
          return { typingUsers: newTypingUsers }
        }, false, 'addTypingUser')
      },
      
      removeTypingUser: (conversationId, userId) => {
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers)
          const conversationTyping = newTypingUsers.get(conversationId) || []
          
          const updatedTyping = conversationTyping.filter(u => u.userId !== userId)
          newTypingUsers.set(conversationId, updatedTyping)
          return { typingUsers: newTypingUsers }
        }, false, 'removeTypingUser')
      },
      
      // Utility actions
      clearStore: () => {
        set({
          conversations: new Map(),
          messages: new Map(),
          selectedConversationId: null,
          typingUsers: new Map()
        }, false, 'clearStore')
      }
    }),
    { name: 'MessageStore' }
  )
)
