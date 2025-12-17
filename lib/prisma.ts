import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in .env");
}

interface PrismaOptions {
  datasources?: {
    db?: {
      url?: string;
    };
  };
  log?: ('query' | 'info' | 'warn' | 'error')[];
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const options: PrismaOptions = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['query'],
};

export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient(options as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;