# Monitoring and Analytics System

A comprehensive monitoring and analytics system for tracking performance metrics, user events, and system health in the StudyMate messaging application.

## Components

### 1. PerformanceMonitor
Tracks performance metrics including Web Vitals, conversation click latency, message render time, and cache performance.

**Features:**
- Web Vitals tracking (LCP, FID, CLS, FCP, TTFB, INP)
- Conversation click latency tracking
- Message render time tracking
- Cache hit/miss rate tracking
- Automatic metric aggregation and summarization

**Usage:**
```typescript
import { performanceMonitor } from '@/lib/monitoring/PerformanceMonitor'

// Track conversation click
const latency = performanceMonitor.trackConversationClick(startTime)

// Track message render
const renderTime = performanceMonitor.trackMessageRender(startTime, messageCount)

// Track cache operations
performanceMonitor.trackCacheHit('conversations')
performanceMonitor.trackCacheMiss('messages')

// Get metrics
const cacheMetrics = performanceMonitor.getCacheMetrics()
const webVitals = performanceMonitor.getWebVitals()
```

### 2. Analytics
Tracks user events and interactions throughout the messaging system.

**Features:**
- Event tracking (conversation opened, message sent, etc.)
- User identification
- Event aggregation and filtering
- External analytics integration (Google Analytics, custom endpoints)

**Usage:**
```typescript
import { analytics } from '@/lib/monitoring/Analytics'

// Set user ID
analytics.setUserId('user-123')

// Track events
analytics.trackConversationOpened({
  conversationId: 'conv-1',
  loadTime: 45,
  cacheHit: true
})

analytics.trackMessageSent({
  messageId: 'msg-1',
  conversationId: 'conv-1',
  optimistic: true,
  deliveryTime: 120
})

analytics.trackPrefetchTriggered({
  conversationId: 'conv-2',
  trigger: 'hover'
})

analytics.trackError({
  error: 'Failed to send message',
  context: 'message-sending'
})
```

### 3. PerformanceDashboard
Aggregates metrics, generates alerts, and provides performance recommendations.

**Features:**
- Real-time metric aggregation
- Automatic alert generation based on thresholds
- Performance recommendations
- Configurable thresholds
- Report generation

**Usage:**
```typescript
import { performanceDashboard } from '@/lib/monitoring/PerformanceDashboard'

// Get dashboard metrics
const metrics = performanceDashboard.getDashboardMetrics()

// Get alerts
const alerts = performanceDashboard.getAlerts()

// Generate report
const report = performanceDashboard.generateReport()

// Update thresholds
performanceDashboard.updateThresholds({
  clickLatency: 100,
  messageRenderTime: 200
})
```

## React Integration

### Hooks

**usePerformanceMonitoring**
```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { trackConversationClick, trackMessageRender } = usePerformanceMonitoring()
  
  const handleClick = () => {
    const endTracking = trackConversationClick()
    // ... perform action
    endTracking()
  }
}
```

**useAnalytics**
```typescript
import { useAnalytics } from '@/hooks/usePerformanceMonitoring'

function MyComponent() {
  const { trackConversationOpened, trackMessageSent } = useAnalytics()
  
  useEffect(() => {
    trackConversationOpened(conversationId, loadTime, cacheHit)
  }, [conversationId])
}
```

### Dashboard Component

```typescript
import { PerformanceDashboardView } from '@/components/monitoring/PerformanceDashboardView'

function App() {
  return (
    <>
      {/* Your app */}
      <PerformanceDashboardView />
    </>
  )
}
```

## API Endpoints

### GET /api/monitoring/metrics
Retrieve all monitoring metrics and dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": { ... },
    "alerts": [ ... ],
    "thresholds": { ... },
    "report": { ... }
  },
  "timestamp": 1234567890
}
```

### POST /api/monitoring/metrics
Perform monitoring actions.

**Actions:**
- `generate_report` - Generate performance report
- `clear_alerts` - Clear all alerts
- `update_thresholds` - Update performance thresholds

**Example:**
```json
{
  "action": "update_thresholds",
  "thresholds": {
    "clickLatency": 100,
    "messageRenderTime": 200
  }
}
```

## Performance Thresholds

Default thresholds for alerts:

| Metric | Threshold | Type |
|--------|-----------|------|
| Click Latency | 100ms | Warning |
| Message Render Time | 200ms | Warning |
| Cache Hit Rate | 70% | Warning |
| LCP | 2500ms | Critical |
| FID | 100ms | Critical |
| CLS | 0.1 | Critical |
| API Response Time | 1000ms | Warning |
| API Error Rate | 5% | Critical |

## External Integration

### Google Analytics
Automatically sends events if `gtag` is available.

### Custom Analytics Endpoint
Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` environment variable.

### Monitoring Service
Set `NEXT_PUBLIC_MONITORING_ENDPOINT` environment variable for alerts.

## Testing

Run the test script:
```bash
npm run test:monitoring
```

## Files

- `PerformanceMonitor.ts` - Performance metrics tracking
- `Analytics.ts` - User event tracking
- `PerformanceDashboard.ts` - Metrics aggregation and alerts
- `index.ts` - Exports all monitoring components
- `README.md` - This file

## Related Files

- `components/monitoring/PerformanceDashboardView.tsx` - Dashboard UI component
- `hooks/usePerformanceMonitoring.ts` - React hooks for monitoring
- `app/api/monitoring/metrics/route.ts` - API endpoint
- `scripts/test-monitoring.ts` - Test script
- `docs/MONITORING_GUIDE.md` - Comprehensive guide

## Best Practices

1. **Track Critical Paths** - Focus on user-facing interactions
2. **Monitor Cache Performance** - Aim for high cache hit rates
3. **Review Alerts Regularly** - Check dashboard in development
4. **Export Metrics** - Analyze trends over time
5. **Optimize Based on Data** - Use recommendations to guide improvements

## License

Part of the StudyMate project.
