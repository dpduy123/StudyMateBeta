# Monitoring and Analytics Guide

This guide explains how to use the monitoring and analytics system for the StudyMate messaging feature.

## Overview

The monitoring system consists of three main components:

1. **Performance Monitor** - Tracks Web Vitals, conversation click latency, message render time, and cache metrics
2. **Analytics** - Tracks user events like conversation opened, message sent, prefetch triggered, and errors
3. **Performance Dashboard** - Aggregates metrics, generates alerts, and provides recommendations

## Installation

All monitoring components are already installed. No additional setup required.

## Usage

### 1. Performance Monitoring

Track performance metrics in your components:

```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { trackConversationClick, trackMessageRender, trackCacheHit } = usePerformanceMonitoring()

  const handleConversationClick = () => {
    const endTracking = trackConversationClick()
    // ... perform action
    endTracking() // Call when action completes
  }

  const handleMessagesLoaded = (messageCount: number) => {
    const endTracking = trackMessageRender(messageCount)
    // ... render messages
    endTracking() // Call when rendering completes
  }

  // Track cache operations
  trackCacheHit('conversations')
  trackCacheMiss('messages')
}
```

### 2. Analytics Tracking

Track user events:

```typescript
import { useAnalytics } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { 
    trackConversationOpened, 
    trackMessageSent, 
    trackPrefetchTriggered,
    trackError 
  } = useAnalytics()

  // Track conversation opened
  trackConversationOpened('conv-123', 45, true) // id, loadTime, cacheHit

  // Track message sent
  trackMessageSent('msg-456', 'conv-123', true, 120) // msgId, convId, optimistic, deliveryTime

  // Track prefetch
  trackPrefetchTriggered('conv-789', 'hover') // id, trigger type

  // Track errors
  trackError('Failed to send message', 'message-sending', { retry: true })
}
```

### 3. Performance Dashboard

View real-time metrics in development:

```typescript
import { PerformanceDashboardView } from '@/components/monitoring/PerformanceDashboardView'

function App() {
  return (
    <>
      {/* Your app content */}
      <PerformanceDashboardView />
    </>
  )
}
```

The dashboard will appear as a floating button in the bottom-right corner (development only).

### 4. API Endpoints

Retrieve metrics programmatically:

```bash
# Get all metrics
GET /api/monitoring/metrics

# Generate performance report
POST /api/monitoring/metrics
{
  "action": "generate_report"
}

# Clear alerts
POST /api/monitoring/metrics
{
  "action": "clear_alerts"
}

# Update thresholds
POST /api/monitoring/metrics
{
  "action": "update_thresholds",
  "thresholds": {
    "clickLatency": 100,
    "messageRenderTime": 200,
    "cacheHitRate": 0.7
  }
}
```

## Metrics Tracked

### Web Vitals
- **LCP** (Largest Contentful Paint) - Target: < 2500ms
- **FID** (First Input Delay) - Target: < 100ms
- **CLS** (Cumulative Layout Shift) - Target: < 0.1
- **FCP** (First Contentful Paint) - Target: < 1800ms
- **TTFB** (Time to First Byte) - Target: < 800ms

### Performance Metrics
- **Conversation Click Latency** - Target: < 100ms
- **Message Render Time** - Target: < 200ms
- **Cache Hit Rate** - Target: > 70%
- **API Response Time** - Target: < 1000ms

### Analytics Events
- `conversation_opened` - When user opens a conversation
- `message_sent` - When user sends a message
- `message_received` - When user receives a message
- `message_read` - When user reads a message
- `prefetch_triggered` - When prefetch is triggered
- `error` - When an error occurs
- `cache_operation` - Cache hit/miss/set/clear
- `api_call` - API request made

## Performance Alerts

The system automatically generates alerts when metrics exceed thresholds:

### Warning Alerts
- Click latency > 100ms
- Message render time > 200ms
- Cache hit rate < 70%
- API response time > 1000ms

### Critical Alerts
- LCP > 2500ms
- FID > 100ms
- CLS > 0.1
- API error rate > 5%

## Testing

Run the monitoring test script:

```bash
npm run test:monitoring
```

Or manually:

```bash
npx tsx scripts/test-monitoring.ts
```

## Integration with External Services

### Google Analytics

The system automatically sends events to Google Analytics if `gtag` is available:

```html
<!-- Add to your HTML head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Custom Analytics Endpoint

Set environment variable to send events to your own endpoint:

```env
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/events
```

### Monitoring Service

Set environment variable to send alerts to monitoring service:

```env
NEXT_PUBLIC_MONITORING_ENDPOINT=https://your-monitoring-api.com/alerts
```

## Production Configuration

In production, protect the metrics endpoint with API key:

```env
MONITORING_API_KEY=your-secret-api-key
```

Then include the key in requests:

```bash
curl -H "Authorization: Bearer your-secret-api-key" \
  https://your-app.com/api/monitoring/metrics
```

## Best Practices

1. **Track Critical User Flows** - Focus on conversation opening, message sending, and cache operations
2. **Monitor Cache Performance** - Aim for > 70% cache hit rate
3. **Set Realistic Thresholds** - Adjust based on your app's performance characteristics
4. **Review Alerts Regularly** - Check dashboard daily in development
5. **Export Metrics** - Periodically export and analyze trends
6. **Optimize Based on Data** - Use recommendations to guide optimization efforts

## Troubleshooting

### Metrics Not Appearing

1. Check that monitoring is enabled in development
2. Verify browser supports PerformanceObserver API
3. Check console for errors

### High Cache Miss Rate

1. Verify IndexedDB is working
2. Check cache warming on app startup
3. Review prefetch strategy

### High Click Latency

1. Check for unnecessary re-renders
2. Verify optimistic updates are working
3. Review component memoization

### High Error Rate

1. Check error events in analytics
2. Review error context and stack traces
3. Implement proper error handling

## API Reference

See the TypeScript interfaces in:
- `lib/monitoring/PerformanceMonitor.ts`
- `lib/monitoring/Analytics.ts`
- `lib/monitoring/PerformanceDashboard.ts`

## Examples

See working examples in:
- `components/chat/ConversationsList.tsx` - Conversation click tracking
- `components/chat/MessageList.tsx` - Message render tracking
- `hooks/useRealtimeMessages.ts` - Message sent tracking
- `lib/cache/CacheManager.ts` - Cache operation tracking
