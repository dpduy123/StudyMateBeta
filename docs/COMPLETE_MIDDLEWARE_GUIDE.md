# 🎯 **Complete Database Monitoring Middleware System**

Hệ thống Database Monitoring Middleware hoàn chỉnh với tất cả các tính năng để chặn, ghi lại và phân tích các request gửi đến database.

## 🏗️ **Architecture Overview**

```
lib/monitoring/
├── database-logger.ts          # Core logging system
├── simple-middleware.ts        # Basic middleware functions
├── middleware-manager.ts       # Comprehensive middleware manager
├── request-context.ts          # Request context capture
├── config.ts                   # Configuration management
└── index.ts                   # Main exports

app/api/admin/database-monitoring/
└── route.ts                   # API endpoints

components/admin/
└── DatabaseMonitoring.tsx     # Admin dashboard
```

## 🚀 **Quick Start**

### **1. Automatic Setup**
Middleware được tự động kích hoạt khi:
```bash
# Development mode
NODE_ENV=development

# Or explicitly enable
ENABLE_DB_MONITORING=true
```

### **2. Manual Configuration**
```typescript
import { middlewareManager } from '@/lib/monitoring'

// Enable monitoring
middlewareManager.enable()

// Create custom middleware
const customMiddleware = middlewareManager.createComprehensiveMiddleware({
  logAllQueries: true,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 1000
})
```

## ⚙️ **Configuration System**

### **Environment Variables**
```bash
# Core settings
ENABLE_DB_MONITORING=true
LOG_ALL_QUERIES=false
LOG_SLOW_QUERIES=true
LOG_ERRORS=true
SLOW_QUERY_THRESHOLD=1000

# Performance settings
MAX_LOGS_IN_MEMORY=1000
AUTO_CLEANUP_DAYS=7

# Feature toggles
ENABLE_CONSOLE_LOGGING=true
ENABLE_PERFORMANCE_METRICS=true
ENABLE_ERROR_TRACKING=true
```

### **Configuration Profiles**

#### **Development Profile**
```typescript
{
  enabled: true,
  logAllQueries: true,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 500,
  enableConsoleLogging: true
}
```

#### **Production Profile**
```typescript
{
  enabled: true,
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 2000,
  excludeModels: ['Session', 'Log', 'Audit']
}
```

## 🎛️ **Middleware Types**

### **1. Simple Middleware**
```typescript
import { createSimpleDatabaseMonitoringMiddleware } from '@/lib/monitoring'

// Basic monitoring for all queries
prisma.$use(createSimpleDatabaseMonitoringMiddleware())
```

### **2. Performance Middleware**
```typescript
import { createPerformanceMonitoringMiddleware } from '@/lib/monitoring'

// Only log slow queries (> 1000ms)
prisma.$use(createPerformanceMonitoringMiddleware(1000))
```

### **3. Error Middleware**
```typescript
import { createErrorMonitoringMiddleware } from '@/lib/monitoring'

// Only log failed operations
prisma.$use(createErrorMonitoringMiddleware())
```

### **4. Comprehensive Middleware**
```typescript
import { middlewareManager } from '@/lib/monitoring'

// Development middleware
prisma.$use(middlewareManager.createDevelopmentMiddleware())

// Production middleware
prisma.$use(middlewareManager.createProductionMiddleware())

// Custom middleware
prisma.$use(middlewareManager.createComprehensiveMiddleware({
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 1500,
  excludeModels: ['Session']
}))
```

## 📊 **Monitoring Features**

### **Automatic Logging**
- ✅ **All database operations** (create, read, update, delete)
- ✅ **Performance metrics** (duration, success/failure)
- ✅ **Request context** (user, IP, user-agent)
- ✅ **Error tracking** với stack traces
- ✅ **Slow query detection**

### **Real-time Metrics**
```typescript
const metrics = middlewareManager.getStatistics()
console.log(metrics)
// {
//   isEnabled: true,
//   metrics: {
//     totalQueries: 1250,
//     averageDuration: 45,
//     slowQueries: 12,
//     errorCount: 3
//   },
//   stats: {
//     mostQueriedModels: [...],
//     mostUsedOperations: [...],
//     averageQueryDuration: 45,
//     slowestQueries: [...]
//   }
// }
```

### **Query Analytics**
- **Most queried models**: Models được query nhiều nhất
- **Most used operations**: Operations phổ biến nhất
- **Average query duration**: Thời gian trung bình
- **Slowest queries**: Top queries chậm nhất
- **Error patterns**: Patterns của errors

## 🖥️ **Admin Dashboard**

### **Features**
- **Real-time metrics** display
- **Query logs** với filtering và search
- **Slow queries** analysis
- **Error tracking** và debugging
- **Statistics** và analytics
- **Export/Import** functionality

### **Usage**
```tsx
import { DatabaseMonitoring } from '@/components/admin/DatabaseMonitoring'

function AdminPage() {
  return <DatabaseMonitoring />
}
```

## 🔧 **API Endpoints**

### **Get Monitoring Data**
```bash
# Recent queries
GET /api/admin/database-monitoring?type=recent&limit=100

# Slow queries
GET /api/admin/database-monitoring?type=slow&slowThreshold=1000

# Error logs
GET /api/admin/database-monitoring?type=errors

# Statistics
GET /api/admin/database-monitoring?type=stats

# By model
GET /api/admin/database-monitoring?type=by-model&model=User

# By user
GET /api/admin/database-monitoring?type=by-user&userId=123
```

### **Management Operations**
```bash
# Clear old logs
DELETE /api/admin/database-monitoring?days=7

# Export logs
GET /api/admin/database-monitoring?type=export
```

## 📈 **Performance Optimization**

### **Memory Management**
```typescript
// Auto-cleanup old logs
middlewareManager.clearOldLogs(7) // Clear logs older than 7 days

// Export logs to file
const logs = middlewareManager.exportLogs()
```

### **Production Settings**
```typescript
// Optimized for production
const productionMiddleware = middlewareManager.createProductionMiddleware()
// - Only logs slow queries (> 2000ms)
// - Only logs errors
// - Excludes sensitive models
// - No console logging
```

### **Selective Monitoring**
```typescript
// Monitor only specific models
const selectiveMiddleware = middlewareManager.createSelectiveMiddleware(['User', 'Match'])

// Exclude sensitive models
const exclusiveMiddleware = middlewareManager.createExclusiveMiddleware(['Session', 'Log'])
```

## 🔍 **Debugging & Troubleshooting**

### **Enable Debug Logging**
```typescript
// Enable console logging for debugging
process.env.ENABLE_CONSOLE_LOGGING=true
```

### **Check Middleware Status**
```typescript
import { middlewareManager } from '@/lib/monitoring'

console.log('Monitoring enabled:', middlewareManager.isMonitoringEnabled())
console.log('Statistics:', middlewareManager.getStatistics())
```

### **Common Issues**

#### **1. Middleware không hoạt động**
```bash
# Check environment variables
echo $ENABLE_DB_MONITORING
echo $NODE_ENV
```

#### **2. Performance impact**
```typescript
// Disable in production if needed
if (process.env.NODE_ENV === 'production') {
  middlewareManager.disable()
}
```

#### **3. Memory issues**
```typescript
// Clear old logs regularly
middlewareManager.clearOldLogs(7)
```

## 📊 **Data Structure**

### **DatabaseLogEntry**
```typescript
interface DatabaseLogEntry {
  id: string
  timestamp: Date
  operation: string        // 'findMany', 'create', 'update', etc.
  model: string           // 'User', 'Match', 'Message', etc.
  query: string           // 'findMany User'
  params: any             // Query parameters
  duration: number        // Execution time in ms
  userId?: string         // Current user ID
  ip?: string            // Client IP
  userAgent?: string     // User agent
  success: boolean       // Query success/failure
  error?: string        // Error message
  stack?: string        // Error stack trace
}
```

### **DatabaseMetrics**
```typescript
interface DatabaseMetrics {
  totalQueries: number
  averageDuration: number
  slowQueries: number
  errorCount: number
  queriesByModel: Record<string, number>
  queriesByOperation: Record<string, number>
}
```

## 🎯 **Best Practices**

### **Development**
- ✅ Enable all logging for debugging
- ✅ Use console logging for immediate feedback
- ✅ Monitor all queries to identify issues

### **Production**
- ✅ Only log slow queries và errors
- ✅ Exclude sensitive models
- ✅ Set appropriate thresholds
- ✅ Regular cleanup of old logs

### **Performance**
- ✅ Use selective monitoring for specific models
- ✅ Set appropriate slow query thresholds
- ✅ Regular cleanup to prevent memory issues
- ✅ Export logs for analysis

## 🚀 **Advanced Usage**

### **Custom Middleware**
```typescript
// Create custom middleware with specific requirements
const customMiddleware = middlewareManager.createComprehensiveMiddleware({
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 1500,
  excludeModels: ['Session', 'Log'],
  includeOnlyModels: ['User', 'Match', 'Message']
})
```

### **Request Context Integration**
```typescript
import { captureRequestContext } from '@/lib/monitoring'

// Capture request context in API routes
export async function GET(request: NextRequest) {
  captureRequestContext(request, user)
  // Database operations will now include request context
}
```

### **Programmatic Access**
```typescript
import { DatabaseLogger } from '@/lib/monitoring'

const logger = DatabaseLogger.getInstance()

// Get recent logs
const logs = logger.getRecentLogs(100)

// Get slow queries
const slowQueries = logger.getSlowQueries(1000, 50)

// Get error logs
const errors = logger.getErrorLogs(50)

// Get metrics
const metrics = logger.getMetrics()

// Get query statistics
const stats = logger.getQueryStats()
```

---

**🎯 Complete Database Monitoring Middleware System đã sẵn sàng!**

Hệ thống cung cấp:
- ✅ **Comprehensive monitoring** cho tất cả database operations
- ✅ **Flexible configuration** cho different environments
- ✅ **Real-time analytics** và performance insights
- ✅ **Admin dashboard** để monitor và manage
- ✅ **Production-ready** với optimized settings
- ✅ **Easy integration** với existing codebase

Bạn có thể bắt đầu sử dụng ngay với automatic setup hoặc customize theo nhu cầu cụ thể! 🚀
