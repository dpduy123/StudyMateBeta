import { SWRConfiguration } from 'swr'

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  // Global error handler
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key)

    // Handle authentication errors globally
    if (error.status === 401) {
      // Redirect to login or handle auth error
      // window.location.href = '/auth/login'
    }
  },

  // Global loading delay to prevent flashing
  loadingTimeout: 3000,

  // Global error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Global deduplication interval (5 minutes default)
  dedupingInterval: 5 * 60 * 1000,

  // Global revalidation settings
  revalidateOnFocus: false, // Disable by default, enable per hook if needed
  revalidateOnReconnect: true,

  // Global refresh interval (disabled by default)
  refreshInterval: 0,

  // Cache provider (optional - for SSR or advanced caching)
  // provider: () => new Map(),
}

// Helper function to create consistent fetcher
export const createFetcher = (baseURL = '') => {
  return async (url: string) => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      // @ts-ignore
      error.status = response.status
      throw error
    }

    return response.json()
  }
}

export const fetcher = createFetcher()