import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from './CacheManager';
import { Conversation, Message } from './db-schema';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  afterEach(async () => {
    await cacheManager.clearCache();
    await cacheManager.close();
  });

  // ==================== Conversation CRUD Tests ====================

  describe('Conversation Operations', () => {
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
    };

    it('should set and get conversations', async () => {
      await cacheManager.setConversations([mockConversation]);
      const conversations = await cacheManager.getConversations();
      
      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toBe('conv-1');
      expect(conversations[0].otherUser.firstName).toBe('John');
    });

    it('should update a conversation', async () => {
      await cacheManager.setConversations([mockConversation]);
      
      await cacheManager.updateConversation('conv-1', {
        unreadCount: 5,
      });
      
      const updated = await cacheManager.getConversation('conv-1');
      expect(updated?.unreadCount).toBe(5);
    });

    it('should get conversations sorted by last activity', async () => {
      const conv1: Conversation = {
        ...mockConversation,
        id: 'conv-1',
        lastActivity: '2024-01-01T10:00:00Z',
      };
      
      const conv2: Conversation = {
        ...mockConversation,
        id: 'conv-2',
        lastActivity: '2024-01-02T10:00:00Z',
      };
      
      await cacheManager.setConversations([conv1, conv2]);
      const conversations = await cacheManager.getConversations();
      
      expect(conversations[0].id).toBe('conv-2'); // Most recent first
      expect(conversations[1].id).toBe('conv-1');
    });

    it('should delete a conversation and its messages', async () => {
      await cacheManager.setConversations([mockConversation]);
      
      const message: Message = {
        id: 'msg-1',
        senderId: 'user-1',
        conversationId: 'conv-1',
        type: 'TEXT',
        content: 'Hello',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      
      await cacheManager.addMessage(message);
      await cacheManager.deleteConversation('conv-1');
      
      const conversation = await cacheManager.getConversation('conv-1');
      const messages = await cacheManager.getMessages('conv-1');
      
      expect(conversation).toBeUndefined();
      expect(messages).toHaveLength(0);
    });
  });

  // ==================== Message CRUD Tests ====================

  describe('Message Operations', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      senderId: 'user-1',
      conversationId: 'conv-1',
      type: 'TEXT',
      content: 'Hello, this is a test message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    it('should add and get messages', async () => {
      await cacheManager.addMessage(mockMessage);
      const messages = await cacheManager.getMessages('conv-1');
      
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[0].content).toBe('Hello, this is a test message');
    });

    it('should update a message', async () => {
      await cacheManager.addMessage(mockMessage);
      
      await cacheManager.updateMessage('msg-1', {
        content: 'Updated message',
        isEdited: true,
      });
      
      const messages = await cacheManager.getMessages('conv-1');
      expect(messages[0].content).toBe('Updated message');
      expect(messages[0].isEdited).toBe(true);
    });

    it('should delete a message', async () => {
      await cacheManager.addMessage(mockMessage);
      await cacheManager.deleteMessage('msg-1');
      
      const messages = await cacheManager.getMessages('conv-1');
      expect(messages).toHaveLength(0);
    });

    it('should get messages with limit', async () => {
      // Add multiple messages
      for (let i = 0; i < 10; i++) {
        await cacheManager.addMessage({
          ...mockMessage,
          id: `msg-${i}`,
          createdAt: new Date(Date.now() + i * 1000).toISOString(),
        });
      }
      
      const messages = await cacheManager.getMessages('conv-1', 5);
      expect(messages).toHaveLength(5);
    });

    it('should return messages sorted by createdAt descending', async () => {
      const msg1: Message = {
        ...mockMessage,
        id: 'msg-1',
        createdAt: '2024-01-01T10:00:00Z',
      };
      
      const msg2: Message = {
        ...mockMessage,
        id: 'msg-2',
        createdAt: '2024-01-02T10:00:00Z',
      };
      
      await cacheManager.addMessage(msg1);
      await cacheManager.addMessage(msg2);
      
      const messages = await cacheManager.getMessages('conv-1');
      expect(messages[0].id).toBe('msg-2'); // Newest first
      expect(messages[1].id).toBe('msg-1');
    });
  });

  // ==================== Cache Eviction Tests ====================

  describe('LRU Eviction', () => {
    it('should evict old messages when exceeding max per conversation', async () => {
      // Add 105 messages (exceeds MAX_MESSAGES_PER_CONVERSATION of 100)
      for (let i = 0; i < 105; i++) {
        await cacheManager.addMessage({
          id: `msg-${i}`,
          senderId: 'user-1',
          conversationId: 'conv-1',
          type: 'TEXT',
          content: `Message ${i}`,
          createdAt: new Date(Date.now() + i * 1000).toISOString(),
          updatedAt: new Date(Date.now() + i * 1000).toISOString(),
          sender: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
          },
        });
      }
      
      const messages = await cacheManager.getMessages('conv-1');
      expect(messages.length).toBeLessThanOrEqual(100);
    });
  });

  // ==================== Cache Management Tests ====================

  describe('Cache Management', () => {
    it('should clear old messages', async () => {
      const oldMessage: Message = {
        id: 'msg-old',
        senderId: 'user-1',
        conversationId: 'conv-1',
        type: 'TEXT',
        content: 'Old message',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      
      const newMessage: Message = {
        ...oldMessage,
        id: 'msg-new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await cacheManager.addMessage(oldMessage);
      await cacheManager.addMessage(newMessage);
      
      await cacheManager.clearOldMessages(7); // Clear messages older than 7 days
      
      const messages = await cacheManager.getMessages('conv-1');
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-new');
    });

    it('should get storage usage', async () => {
      const usage = await cacheManager.getStorageUsage();
      expect(usage).toBeGreaterThanOrEqual(0);
    });

    it('should clear all cache', async () => {
      const conversation: Conversation = {
        id: 'conv-1',
        otherUser: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          isOnline: true,
        },
        unreadCount: 0,
        lastActivity: new Date().toISOString(),
        _cached: true,
        _lastSync: new Date().toISOString(),
        _prefetched: false,
      };
      
      const message: Message = {
        id: 'msg-1',
        senderId: 'user-1',
        conversationId: 'conv-1',
        type: 'TEXT',
        content: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      
      await cacheManager.setConversations([conversation]);
      await cacheManager.addMessage(message);
      
      await cacheManager.clearCache();
      
      const conversations = await cacheManager.getConversations();
      const messages = await cacheManager.getMessages('conv-1');
      
      expect(conversations).toHaveLength(0);
      expect(messages).toHaveLength(0);
    });

    it('should get cache statistics', async () => {
      const conversation: Conversation = {
        id: 'conv-1',
        otherUser: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          isOnline: true,
        },
        unreadCount: 0,
        lastActivity: new Date().toISOString(),
        _cached: true,
        _lastSync: new Date().toISOString(),
        _prefetched: false,
      };
      
      await cacheManager.setConversations([conversation]);
      
      const stats = await cacheManager.getCacheStats();
      
      expect(stats.conversationCount).toBe(1);
      expect(stats.messageCount).toBe(0);
      expect(stats.storageUsage).toBeGreaterThanOrEqual(0);
      expect(stats.lastSync).toBeTruthy();
    });
  });

  // ==================== Compression Tests ====================

  describe('Message Compression', () => {
    it('should compress large messages', async () => {
      // Create a message larger than 1KB
      const largeContent = 'A'.repeat(2000);
      const largeMessage: Message = {
        id: 'msg-large',
        senderId: 'user-1',
        conversationId: 'conv-1',
        type: 'TEXT',
        content: largeContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      
      await cacheManager.addMessage(largeMessage);
      const messages = await cacheManager.getMessages('conv-1');
      
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe(largeContent); // Should be decompressed when retrieved
    });
  });
});
