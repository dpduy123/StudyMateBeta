'use client'

import { useState } from 'react'
import { ConversationListSkeleton, MessageListSkeleton } from '@/components/ui/SkeletonLoader'

/**
 * Test page to preview skeleton loaders
 * Navigate to /test-skeleton to see the skeletons
 */
export default function TestSkeletonPage() {
  const [showConversations, setShowConversations] = useState(true)
  const [showMessages, setShowMessages] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Skeleton Loader Preview</h1>
        
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showConversations ? 'Hide' : 'Show'} Conversation Skeleton
          </button>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showMessages ? 'Hide' : 'Show'} Message Skeleton
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversation List Skeleton */}
          {showConversations && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Conversation List Skeleton</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Shown when loading conversations with no cached data
                </p>
              </div>
              <div className="h-[600px]">
                <ConversationListSkeleton />
              </div>
            </div>
          )}

          {/* Message List Skeleton */}
          {showMessages && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Message List Skeleton</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Shown when loading messages with no cached data
                </p>
              </div>
              <div className="h-[600px]">
                <MessageListSkeleton />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Test in Real App</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Open browser console (F12)</li>
            <li>Type: <code className="bg-blue-100 px-2 py-1 rounded">await window.clearCache()</code></li>
            <li>Refresh the page to see skeletons in action</li>
            <li>Skeletons will show briefly before cached data loads</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            Note: Skeletons are designed to show only when no cached data is available,
            following the cache-first loading strategy (Requirement 1).
          </p>
        </div>
      </div>
    </div>
  )
}
