# Database Monitoring Middleware

Hệ thống Database Monitoring middleware cho phép chặn và ghi lại tất cả các request gửi đến database, cung cấp insights về performance và debugging.

## 🚀 **Tính năng chính**

### **1. Automatic Query Logging**
- ✅ **Intercept tất cả Prisma queries**
- ✅ **Log performance metrics** (duration, success/failure)
- ✅ **Capture request context** (user, IP, user-agent)
- ✅ **Error tracking** với stack traces

### **2. Performance Monitoring**
- ✅ **Slow query detection** (configurable threshold)
- ✅ **Average duration tracking**
- ✅ **Query statistics** by model và operation
- ✅ **Real-time metrics**

### **3. Admin Dashboard**
- ✅ **Web interface** để xem logs
- ✅ **Filter và search** capabilities
- ✅ **Export logs** to JSON
- ✅ **Clear old logs** functionality

## 📁 **Cấu trúc files**

```
lib/monitoring/
├── database-logger.ts          # Core logging system
├── prisma-middleware.ts        # Prisma middleware functions
├── request-context.ts          # Request context capture
└── index.ts                   # Exports

app/api/admin/database-monitoring/
└── route.ts                   # API endpoints

components/admin/
└── DatabaseMonitoring.tsx     # Admin dashboard component
```

## ⚙️ **Cấu hình**

### **Environment Variables**
```bash
# Enable database monitoring
ENABLE_DB_MONITORING=true

# Development mode (logs all queries)
NODE_ENV=development
```

### **Prisma Configuration**
```typescript
// lib/prisma.ts
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Middleware được tự động thêm vào Prisma client
```

## 🔧 **Sử dụng**

### **1. Basic Usage**
Middleware được tự động kích hoạt khi:
- `NODE_ENV=development` 
- `ENABLE_DB_MONITORING=true`

### **2. API Endpoints**

#### **Get Monitoring Data**
```bash
GET /api/admin/database-monitoring?type=recent&limit=100
GET /api/admin/database-monitoring?type=slow&slowThreshold=1000
GET /api/admin/database-monitoring?type=errors
GET /api/admin/database-monitoring?type=stats
GET /api/admin/database-monitoring?type=by-model&model=User
GET /api/admin/database-monitoring?type=by-user&userId=123
```

#### **Clear Old Logs**
```bash
DELETE /api/admin/database-monitoring?days=7
```

#### **Export Logs**
```bash
GET /api/admin/database-monitoring?type=export
```

### **3. Programmatic Usage**

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

## 🎛️ **Middleware Options**

### **Basic Monitoring**
```typescript
prisma.$use(createDatabaseMonitoringMiddleware())
```

### **Advanced Monitoring**
```typescript
prisma.$use(createAdvancedDatabaseMonitoringMiddleware({
  slowQueryThreshold: 1000,    // Log queries > 1 second
  logSlowQueries: true,        // Log slow queries
  logAllQueries: false,        // Log all queries (dev only)
  excludeModels: ['Session'],  // Exclude specific models
  includeOnlyModels: ['User'] // Only include specific models
}))
```

### **Selective Monitoring**
```typescript
prisma.$use(createSelectiveDatabaseMonitoringMiddleware([
  'create', 'update', 'delete'  // Only log these operations
]))
```

## 🖥️ **Admin Dashboard**

### **Features**
- **Real-time metrics** display
- **Query logs** với filtering
- **Slow queries** analysis
- **Error tracking**
- **Statistics** và analytics
- **Export functionality**

### **Usage**
```tsx
import { DatabaseMonitoring } from '@/components/admin/DatabaseMonitoring'

function AdminPage() {
  return <DatabaseMonitoring />
}
```

## 🔍 **Monitoring Types**

### **1. Recent Queries**
- Hiển thị các queries gần đây nhất
- Filter by model, operation, duration
- Real-time updates

### **2. Slow Queries**
- Queries chậm hơn threshold
- Sorted by duration
- Performance analysis

### **3. Error Logs**
- Failed queries
- Error messages và stack traces
- Debugging information

### **4. Statistics**
- Most queried models
- Most used operations
- Average query duration
- Slowest queries

## 🚨 **Performance Considerations**

### **Memory Management**
- **Auto-cleanup**: Giữ tối đa 1000 logs trong memory
- **Old logs removal**: Clear logs older than 7 days
- **Efficient storage**: Chỉ store essential data

### **Production Settings**
```typescript
// Production configuration
prisma.$use(createAdvancedDatabaseMonitoringMiddleware({
  slowQueryThreshold: 2000,     // Higher threshold
  logSlowQueries: true,          // Only log slow queries
  logAllQueries: false,          // Don't log all queries
  excludeModels: ['Session', 'Log'] // Exclude sensitive models
}))
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Middleware không hoạt động**
```bash
# Check environment variables
echo $ENABLE_DB_MONITORING
echo $NODE_ENV
```

#### **2. Performance impact**
```typescript
// Disable in production
if (process.env.NODE_ENV === 'production') {
  // Skip middleware
}
```

#### **3. Memory issues**
```typescript
// Clear old logs regularly
logger.clearOldLogs(7) // Clear logs older than 7 days
```

## 📈 **Analytics & Insights**

### **Query Performance**
- Average query duration
- Slow query identification
- Performance trends

### **Usage Patterns**
- Most queried models
- Popular operations
- User activity patterns

### **Error Analysis**
- Error frequency
- Common failure points
- Debugging information

---

**Database Monitoring Middleware đã sẵn sàng sử dụng!** 🎯

Hệ thống sẽ tự động bắt đầu monitoring khi được kích hoạt và cung cấp insights chi tiết về database performance và usage patterns.
