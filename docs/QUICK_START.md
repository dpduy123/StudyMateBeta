# 🚀 **Quick Start - Database Monitoring Middleware**

Hướng dẫn nhanh để sử dụng Database Monitoring Middleware.

## ⚡ **1. Automatic Setup (Recommended)**

### **Enable trong Development**
```bash
# Tự động enable khi NODE_ENV=development
NODE_ENV=development
```

### **Enable trong Production**
```bash
# Explicit enable
ENABLE_DB_MONITORING=true
```

## 🔧 **2. Manual Setup**

### **Basic Usage**
```typescript
import { middlewareManager } from '@/lib/monitoring'

// Enable monitoring
middlewareManager.enable()

// Get statistics
const stats = middlewareManager.getStatistics()
console.log(stats)
```

### **Custom Configuration**
```typescript
import { middlewareManager } from '@/lib/monitoring'

// Create custom middleware
const customMiddleware = middlewareManager.createComprehensiveMiddleware({
  logAllQueries: false,
  logSlowQueries: true,
  logErrors: true,
  slowQueryThreshold: 1500,
  excludeModels: ['Session']
})

// Apply to Prisma
prisma.$use(customMiddleware)
```

## 📊 **3. View Monitoring Data**

### **API Endpoints**
```bash
# Recent queries
GET /api/admin/database-monitoring?type=recent&limit=100

# Slow queries
GET /api/admin/database-monitoring?type=slow&slowThreshold=1000

# Errors
GET /api/admin/database-monitoring?type=errors

# Statistics
GET /api/admin/database-monitoring?type=stats
```

### **Programmatic Access**
```typescript
import { DatabaseLogger } from '@/lib/monitoring'

const logger = DatabaseLogger.getInstance()

// Get recent logs
const logs = logger.getRecentLogs(100)

// Get slow queries
const slowQueries = logger.getSlowQueries(1000, 50)

// Get metrics
const metrics = logger.getMetrics()
```

## 🧪 **4. Testing**

### **Run Tests**
```typescript
import { quickTest, performanceTest } from '@/lib/monitoring'

// Quick test
const results = await quickTest()

// Performance test
const perf = await performanceTest(1000)
```

### **Test Individual Components**
```typescript
import { DatabaseMonitoringTester } from '@/lib/monitoring'

const tester = new DatabaseMonitoringTester()

// Test basic logging
await tester.testBasicLogging()

// Test slow query detection
await tester.testSlowQueryDetection()

// Test error logging
await tester.testErrorLogging()

// Run all tests
await tester.runAllTests()
```

## ⚙️ **5. Configuration**

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
```

### **Configuration Profiles**
- **Development**: Log all queries, console logging enabled
- **Production**: Only slow queries và errors, optimized performance
- **Test**: Minimal logging, error tracking only

## 🎯 **6. Common Use Cases**

### **Debug Slow Queries**
```typescript
// Get slow queries
const slowQueries = logger.getSlowQueries(1000, 50)
console.log('Slow queries:', slowQueries)
```

### **Monitor Errors**
```typescript
// Get error logs
const errors = logger.getErrorLogs(50)
console.log('Database errors:', errors)
```

### **Performance Analysis**
```typescript
// Get performance metrics
const metrics = logger.getMetrics()
console.log('Performance metrics:', metrics)

// Get query statistics
const stats = logger.getQueryStats()
console.log('Query statistics:', stats)
```

### **Export Data**
```typescript
// Export all logs
const exportData = logger.exportLogs()
console.log('Exported data:', exportData)

// Clear old logs
logger.clearOldLogs(7) // Clear logs older than 7 days
```

## 🚨 **7. Troubleshooting**

### **Check if Monitoring is Enabled**
```typescript
import { middlewareManager } from '@/lib/monitoring'

console.log('Monitoring enabled:', middlewareManager.isMonitoringEnabled())
```

### **Check Statistics**
```typescript
const stats = middlewareManager.getStatistics()
console.log('Current statistics:', stats)
```

### **Clear Test Data**
```typescript
import { DatabaseMonitoringTester } from '@/lib/monitoring'

const tester = new DatabaseMonitoringTester()
tester.clearTestData()
```

## 📈 **8. Performance Tips**

### **Production Settings**
```typescript
// Use production middleware for better performance
prisma.$use(middlewareManager.createProductionMiddleware())
```

### **Selective Monitoring**
```typescript
// Monitor only specific models
const selectiveMiddleware = middlewareManager.createSelectiveMiddleware(['User', 'Match'])

// Exclude sensitive models
const exclusiveMiddleware = middlewareManager.createExclusiveMiddleware(['Session', 'Log'])
```

### **Memory Management**
```typescript
// Regular cleanup
middlewareManager.clearOldLogs(7) // Clear logs older than 7 days

// Export and clear
const logs = middlewareManager.exportLogs()
middlewareManager.clearOldLogs(0) // Clear all logs
```

## 🎯 **9. Next Steps**

1. **Enable monitoring**: Set environment variables
2. **Test functionality**: Run quick tests
3. **Monitor performance**: Check slow queries
4. **Debug issues**: Use error logs
5. **Optimize queries**: Based on monitoring data
6. **Set up alerts**: For production monitoring

---

**🎯 Database Monitoring Middleware is ready to use!**

Start with automatic setup in development mode, then customize configuration as needed for production use. 🚀
