import { PrismaClient } from "@/lib/generated/prisma";
import { middlewareManager } from './monitoring/middleware-manager';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.SUPABASE_CONNECTION_STRING
      }
    },
    // Configure connection pool to prevent timeouts
    transactionOptions: {
      timeout: 20000, // 20 seconds
    },
  });

  // Add database monitoring middleware
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DB_MONITORING === 'true') {
    try {
      // Enable middleware manager
      middlewareManager.enable()
      
      // Add appropriate middleware based on environment
      if (process.env.NODE_ENV === 'development') {
        (client as any).$use(middlewareManager.createDevelopmentMiddleware())
        console.log('🔍 Development database monitoring enabled')
      } else {
        (client as any).$use(middlewareManager.createProductionMiddleware())
        console.log('🔍 Production database monitoring enabled')
      }
      
    } catch (error) {
      console.warn('⚠️ Failed to add database monitoring middleware:', error)
    }
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent connection leaks in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;