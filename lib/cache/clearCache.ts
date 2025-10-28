/**
 * Utility to clear IndexedDB cache for testing skeleton loaders
 * This is useful for development and testing purposes
 */

import { cacheManager } from './CacheManager'

export async function clearAllCache() {
  try {
    // Clear all conversations
    const conversations = await cacheManager.getConversations()
    for (const conv of conversations) {
      await cacheManager.deleteConversation(conv.id)
    }

    // Clear all messages for each conversation
    for (const conv of conversations) {
      const messages = await cacheManager.getMessages(conv.id)
      for (const msg of messages) {
        await cacheManager.deleteMessage(msg.id)
      }
    }

    console.log('✅ Cache cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to clear cache:', error)
    return false
  }
}

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).clearCache = clearAllCache
}
