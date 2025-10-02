import { NextRequest } from 'next/server'

/**
 * Request context middleware to capture request information for database logging
 */
export function captureRequestContext(request: NextRequest, user?: any) {
  // Store request context in global scope for database middleware to access
  ;(global as any).currentRequest = {
    ip: getClientIP(request),
    headers: Object.fromEntries(request.headers.entries()),
    user,
    url: request.url,
    method: request.method,
    timestamp: new Date()
  }
}

/**
 * Extract client IP from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for client IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to unknown if no IP found
  return 'unknown'
}

/**
 * Clear request context after processing
 */
export function clearRequestContext() {
  delete (global as any).currentRequest
}

/**
 * Get current request context
 */
export function getCurrentRequestContext() {
  return (global as any).currentRequest || null
}
