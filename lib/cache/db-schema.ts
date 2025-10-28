import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database configuration
export const DB_NAME = 'studymate-messaging';
export const DB_VERSION = 1;

// Type definitions for IndexedDB schema
export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isOnline: boolean;
    lastActive?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  lastActivity: string;
  
  // Cache metadata
  _cached: boolean;
  _lastSync: string;
  _prefetched: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  conversationId: string;
  type: 'TEXT' | 'FILE' | 'VOICE' | 'VIDEO';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  isEdited?: boolean;
  editedAt?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  
  replyTo?: Message;
  reactions?: MessageReaction[];
  
  // Optimistic update metadata
  _optimistic?: boolean;
  _operationId?: string;
  _status?: 'pending' | 'confirmed' | 'failed';
  
  // Cache metadata
  _cached?: boolean;
  _compressed?: boolean;
}

export interface MessageReaction {
  emoji: string;
  users: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  count: number;
}

export interface CacheMetadata {
  key: string;
  value: any;
  updatedAt: string;
}

// IndexedDB Schema interface
export interface MessagingDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: {
      'lastActivity': string;
      'unreadCount': number;
    };
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      'conversationId': string;
      'createdAt': string;
      'conversation_time': [string, string];
    };
  };
  metadata: {
    key: string;
    value: CacheMetadata;
  };
}

// Initialize and open database
export async function initDB(): Promise<IDBPDatabase<MessagingDB>> {
  return openDB<MessagingDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', {
          keyPath: 'id',
        });
        
        // Add indexes for efficient querying
        conversationStore.createIndex('lastActivity', 'lastActivity');
        conversationStore.createIndex('unreadCount', 'unreadCount');
      }
      
      // Create messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', {
          keyPath: 'id',
        });
        
        // Add indexes for efficient querying
        messageStore.createIndex('conversationId', 'conversationId');
        messageStore.createIndex('createdAt', 'createdAt');
        
        // Compound index for conversation + time queries
        messageStore.createIndex('conversation_time', ['conversationId', 'createdAt']);
      }
      
      // Create metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', {
          keyPath: 'key',
        });
      }
    },
  });
}
