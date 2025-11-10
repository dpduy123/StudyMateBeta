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
    // Optimize for PgBouncer connection pooling
    transactionOptions: {
      timeout: 10000, // 10 seconds (reduced from 20s)
      maxWait: 5000, // 5 seconds max wait for connection
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['warn', 'error'] 
      : ['error'],
  });

  let prismaClient: PrismaClient = client;

  const shouldMonitor =
    process.env.NODE_ENV === 'development' ||
    process.env.ENABLE_DB_MONITORING === 'true';

  if (shouldMonitor) {
    let monitoringInitialized = false;
    try {
      const env = process.env.NODE_ENV === 'development' ? 'Development' : 'Production';
      const middleware =
        process.env.NODE_ENV === 'development'
          ? middlewareManager.createDevelopmentMiddleware()
          : middlewareManager.createProductionMiddleware();

      const hasClassicMiddleware = typeof (client as any).$use === 'function';
      const hasQueryExtensions = typeof (client as any).$extends === 'function';

      if (hasClassicMiddleware) {
        middlewareManager.enable();
        monitoringInitialized = true;
        (client as any).$use(middleware);
        console.log(`🔍 ${env} database monitoring enabled`);
      } else if (hasQueryExtensions) {
        middlewareManager.enable();
        monitoringInitialized = true;
        prismaClient = (client as any).$extends({
          query: {
            $allModels: {
              $allOperations: async ({ model, operation, args, query }: any) => {
                const params = { model, action: operation, args };

                return middleware(params, async (nextParams?: typeof params) => {
                  const finalParams = nextParams ?? params;
                  const nextArgs = finalParams.args ?? args;
                  return query(nextArgs);
                });
              },
            },
          },
        }) as PrismaClient;
        console.log(`🔍 ${env} database monitoring enabled`);
      } else {
        console.warn('⚠️ Prisma client variant does not support database monitoring middleware');
      }
    } catch (error) {
      if (monitoringInitialized && middlewareManager.isMonitoringEnabled()) {
        middlewareManager.disable();
      }
      console.warn('⚠️ Failed to add database monitoring middleware:', error);
    }
  }

  return prismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent connection leaks in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Default export for convenience
export default prisma;
