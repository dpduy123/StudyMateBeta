import { IDBPDatabase, IDBPTransaction } from 'idb';
import pako from 'pako';
import {
    initDB,
    MessagingDB,
    Conversation,
    Message,
    CacheMetadata,
} from './db-schema';

export class CacheManager {
    private db: IDBPDatabase<MessagingDB> | null = null;
    private initPromise: Promise<IDBPDatabase<MessagingDB>> | null = null;

    // Maximum number of messages to keep per conversation
    private readonly MAX_MESSAGES_PER_CONVERSATION = 100;

    // Maximum storage size in bytes (50MB)
    private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024;

    // Compression threshold in bytes (1KB)
    private readonly COMPRESSION_THRESHOLD = 1024;

    /**
     * Initialize the database connection
     */
    private async getDB(): Promise<IDBPDatabase<MessagingDB>> {
        if (this.db) {
            return this.db;
        }

        if (!this.initPromise) {
            this.initPromise = initDB();
        }

        this.db = await this.initPromise;
        return this.db;
    }

    // ==================== Conversation Methods ====================

    /**
     * Get all conversations from cache
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const db = await this.getDB();
            const conversations = await db.getAll('conversations');

            // Sort by last activity (most recent first)
            return conversations.sort((a, b) =>
                new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            );
        } catch (error) {
            console.error('Error getting conversations from cache:', error);
            return [];
        }
    }

    /**
     * Set conversations in cache (bulk operation)
     */
    async setConversations(conversations: Conversation[]): Promise<void> {
        try {
            const db = await this.getDB();
            const tx = db.transaction('conversations', 'readwrite');

            // Add cache metadata
            const now = new Date().toISOString();
            const conversationsWithMetadata = conversations.map(conv => ({
                ...conv,
                _cached: true,
                _lastSync: now,
                _prefetched: conv._prefetched || false,
            }));

            // Store all conversations
            await Promise.all([
                ...conversationsWithMetadata.map(conv => tx.store.put(conv)),
                tx.done,
            ]);

            // Update metadata
            await this.setMetadata('conversations_last_sync', now);
        } catch (error) {
            if (this.isQuotaExceededError(error)) {
                await this.handleQuotaExceeded();
                // Retry once after cleanup
                await this.setConversations(conversations);
            } else {
                console.error('Error setting conversations in cache:', error);
                throw error;
            }
        }
    }

    /**
     * Update a single conversation in cache
     */
    async updateConversation(
        id: string,
        data: Partial<Conversation>
    ): Promise<void> {
        try {
            const db = await this.getDB();
            const existing = await db.get('conversations', id);

            if (!existing) {
                console.warn(`Conversation ${id} not found in cache`);
                return;
            }

            const updated: Conversation = {
                ...existing,
                ...data,
                _lastSync: new Date().toISOString(),
            };

            await db.put('conversations', updated);
        } catch (error) {
            if (this.isQuotaExceededError(error)) {
                await this.handleQuotaExceeded();
                await this.updateConversation(id, data);
            } else {
                console.error('Error updating conversation in cache:', error);
                throw error;
            }
        }
    }

    /**
     * Get a single conversation by ID
     */
    async getConversation(id: string): Promise<Conversation | undefined> {
        try {
            const db = await this.getDB();
            return await db.get('conversations', id);
        } catch (error) {
            console.error('Error getting conversation from cache:', error);
            return undefined;
        }
    }

    /**
     * Delete a conversation from cache
     */
    async deleteConversation(id: string): Promise<void> {
        try {
            const db = await this.getDB();
            const tx = db.transaction(['conversations', 'messages'], 'readwrite');

            // Delete conversation
            await tx.objectStore('conversations').delete(id);

            // Delete all messages in this conversation
            const messageIndex = tx.objectStore('messages').index('conversationId');
            const messages = await messageIndex.getAllKeys(id);

            await Promise.all([
                ...messages.map(key => tx.objectStore('messages').delete(key)),
                tx.done,
            ]);
        } catch (error) {
            console.error('Error deleting conversation from cache:', error);
            throw error;
        }
    }

    // ==================== Error Handling ====================

    /**
     * Check if error is quota exceeded
     */
    private isQuotaExceededError(error: any): boolean {
        return (
            error instanceof DOMException &&
            (error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        );
    }

    /**
     * Handle quota exceeded by clearing old data
     */
    private async handleQuotaExceeded(): Promise<void> {
        console.warn('IndexedDB quota exceeded, clearing old data...');

        // Clear messages older than 7 days
        await this.clearOldMessages(7);

        // If still over quota, clear more aggressively
        const usage = await this.getStorageUsage();
        if (usage > this.MAX_STORAGE_SIZE * 0.9) {
            await this.clearOldMessages(3);
        }
    }

    // ==================== Metadata Methods ====================

    /**
     * Set metadata value
     */
    private async setMetadata(key: string, value: any): Promise<void> {
        try {
            const db = await this.getDB();
            const metadata: CacheMetadata = {
                key,
                value,
                updatedAt: new Date().toISOString(),
            };
            await db.put('metadata', metadata);
        } catch (error) {
            console.error('Error setting metadata:', error);
        }
    }

    /**
     * Get metadata value
     */
    private async getMetadata(key: string): Promise<any> {
        try {
            const db = await this.getDB();
            const metadata = await db.get('metadata', key);
            return metadata?.value;
        } catch (error) {
            console.error('Error getting metadata:', error);
            return null;
        }
    }

    // ==================== Message Methods ====================

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
        try {
            const db = await this.getDB();
            const index = db.transaction('messages').store.index('conversation_time');

            // Get messages for this conversation, sorted by time (newest first)
            const range = IDBKeyRange.bound(
                [conversationId, ''],
                [conversationId, '\uffff']
            );

            let messages = await index.getAll(range);

            // Sort by createdAt descending (newest first)
            messages.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            // Apply limit if specified
            if (limit && limit > 0) {
                messages = messages.slice(0, limit);
            }

            // Decompress messages if needed
            const decompressedMessages = await Promise.all(
                messages.map(msg => this.decompressMessage(msg))
            );

            return decompressedMessages;
        } catch (error) {
            console.error('Error getting messages from cache:', error);
            return [];
        }
    }

    /**
     * Add a message to cache
     */
    async addMessage(message: Message): Promise<void> {
        try {
            const db = await this.getDB();

            // Add cache metadata
            const messageWithMetadata: Message = {
                ...message,
                _cached: true,
            };

            // Compress if message is large
            const compressedMessage = await this.compressMessage(messageWithMetadata);

            await db.add('messages', compressedMessage);

            // Implement LRU eviction: check if we exceed max messages per conversation
            await this.evictOldMessagesIfNeeded(message.conversationId);
        } catch (error) {
            if (this.isQuotaExceededError(error)) {
                await this.handleQuotaExceeded();
                await this.addMessage(message);
            } else {
                console.error('Error adding message to cache:', error);
                throw error;
            }
        }
    }

    /**
     * Update a message in cache
     */
    async updateMessage(messageId: string, data: Partial<Message>): Promise<void> {
        try {
            const db = await this.getDB();
            const existing = await db.get('messages', messageId);

            if (!existing) {
                console.warn(`Message ${messageId} not found in cache`);
                return;
            }

            // Decompress if needed before updating
            const decompressed = await this.decompressMessage(existing);

            const updated: Message = {
                ...decompressed,
                ...data,
                updatedAt: new Date().toISOString(),
            };

            // Compress if needed
            const compressed = await this.compressMessage(updated);

            await db.put('messages', compressed);
        } catch (error) {
            if (this.isQuotaExceededError(error)) {
                await this.handleQuotaExceeded();
                await this.updateMessage(messageId, data);
            } else {
                console.error('Error updating message in cache:', error);
                throw error;
            }
        }
    }

    /**
     * Delete a message from cache
     */
    async deleteMessage(messageId: string): Promise<void> {
        try {
            const db = await this.getDB();
            await db.delete('messages', messageId);
        } catch (error) {
            console.error('Error deleting message from cache:', error);
            throw error;
        }
    }

    // ==================== LRU Eviction Strategy ====================

    /**
     * Evict old messages if conversation exceeds max message count
     */
    private async evictOldMessagesIfNeeded(conversationId: string): Promise<void> {
        try {
            const db = await this.getDB();
            const index = db.transaction('messages').store.index('conversationId');
            const messages = await index.getAll(conversationId);

            if (messages.length > this.MAX_MESSAGES_PER_CONVERSATION) {
                // Sort by createdAt ascending (oldest first)
                messages.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                // Delete oldest messages to get back to limit
                const toDelete = messages.length - this.MAX_MESSAGES_PER_CONVERSATION;
                const tx = db.transaction('messages', 'readwrite');

                await Promise.all([
                    ...messages.slice(0, toDelete).map(msg => tx.store.delete(msg.id)),
                    tx.done,
                ]);

                console.log(`Evicted ${toDelete} old messages from conversation ${conversationId}`);
            }
        } catch (error) {
            console.error('Error evicting old messages:', error);
        }
    }

    // ==================== Compression Methods ====================

    /**
     * Compress message content if it exceeds threshold
     */
    private async compressMessage(message: Message): Promise<Message> {
        const contentSize = new Blob([message.content]).size;

        if (contentSize > this.COMPRESSION_THRESHOLD) {
            try {
                // Convert string to Uint8Array, compress, then convert to base64
                const encoder = new TextEncoder();
                const data = encoder.encode(message.content);
                const compressed = pako.deflate(data);
                const base64 = btoa(String.fromCharCode(...compressed));

                return {
                    ...message,
                    content: base64,
                    _compressed: true,
                };
            } catch (error) {
                console.error('Error compressing message:', error);
                return message;
            }
        }

        return message;
    }

    /**
     * Decompress message content if it was compressed
     */
    private async decompressMessage(message: Message): Promise<Message> {
        if (message._compressed) {
            try {
                // Convert base64 to Uint8Array, decompress, then convert to string
                const binary = atob(message.content);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const decompressed = pako.inflate(bytes);
                const decoder = new TextDecoder();
                const content = decoder.decode(decompressed);

                return {
                    ...message,
                    content,
                    _compressed: false,
                };
            } catch (error) {
                console.error('Error decompressing message:', error);
                return message;
            }
        }

        return message;
    }

    // ==================== Cache Management Utilities ====================

    /**
     * Clear messages older than specified days
     */
    async clearOldMessages(daysOld: number): Promise<void> {
        try {
            const db = await this.getDB();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const cutoffTimestamp = cutoffDate.toISOString();

            const tx = db.transaction('messages', 'readwrite');
            const store = tx.store;
            const index = store.index('createdAt');

            // Get all messages older than cutoff
            const range = IDBKeyRange.upperBound(cutoffTimestamp);
            let cursor = await index.openCursor(range);

            let deletedCount = 0;
            while (cursor) {
                await cursor.delete();
                deletedCount++;
                cursor = await cursor.continue();
            }

            await tx.done;

            console.log(`Cleared ${deletedCount} messages older than ${daysOld} days`);
        } catch (error) {
            console.error('Error clearing old messages:', error);
            throw error;
        }
    }

    /**
     * Get current storage usage in bytes
     */
    async getStorageUsage(): Promise<number> {
        try {
            // Check if StorageManager API is available
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return estimate.usage || 0;
            }

            // Fallback: estimate based on IndexedDB data
            const db = await this.getDB();
            let totalSize = 0;

            // Estimate conversations size
            const conversations = await db.getAll('conversations');
            totalSize += new Blob([JSON.stringify(conversations)]).size;

            // Estimate messages size
            const messages = await db.getAll('messages');
            totalSize += new Blob([JSON.stringify(messages)]).size;

            // Estimate metadata size
            const metadata = await db.getAll('metadata');
            totalSize += new Blob([JSON.stringify(metadata)]).size;

            return totalSize;
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return 0;
        }
    }

    /**
     * Clear all cached data
     */
    async clearCache(): Promise<void> {
        try {
            const db = await this.getDB();
            const tx = db.transaction(['conversations', 'messages', 'metadata'], 'readwrite');

            await Promise.all([
                tx.objectStore('conversations').clear(),
                tx.objectStore('messages').clear(),
                tx.objectStore('metadata').clear(),
                tx.done,
            ]);

            console.log('Cache cleared successfully');
        } catch (error) {
            console.error('Error clearing cache:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<{
        conversationCount: number;
        messageCount: number;
        storageUsage: number;
        lastSync: string | null;
    }> {
        try {
            const db = await this.getDB();

            const [conversations, messages, storageUsage, lastSync] = await Promise.all([
                db.count('conversations'),
                db.count('messages'),
                this.getStorageUsage(),
                this.getMetadata('conversations_last_sync'),
            ]);

            return {
                conversationCount: conversations,
                messageCount: messages,
                storageUsage,
                lastSync,
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {
                conversationCount: 0,
                messageCount: 0,
                storageUsage: 0,
                lastSync: null,
            };
        }
    }

    /**
     * Check if cache is healthy
     */
    async isCacheHealthy(): Promise<boolean> {
        try {
            const stats = await this.getCacheStats();

            // Check if storage usage is within limits
            if (stats.storageUsage > this.MAX_STORAGE_SIZE) {
                return false;
            }

            // Check if last sync was recent (within 24 hours)
            if (stats.lastSync) {
                const lastSyncDate = new Date(stats.lastSync);
                const hoursSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);
                if (hoursSinceSync > 24) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking cache health:', error);
            return false;
        }
    }

    /**
     * Close database connection
     */
    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initPromise = null;
        }
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();
