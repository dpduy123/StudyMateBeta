import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
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

// Prevent connection leaks in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;