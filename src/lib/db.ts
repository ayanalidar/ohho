import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized for Vercel serverless + Supabase:
// - Uses pgbouncer (transaction mode) to prevent connection exhaustion
// - connection_limit=1 per function instance
// - No query logging (was causing OOM)
const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || ''
  // Ensure pgbouncer + connection_limit params are in the URL
  // This prevents "max clients reached" errors on Supabase free tier
  const optimizedUrl = url.includes('pgbouncer=true')
    ? url
    : url + (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1&pool_timeout=30'

  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: { url: optimizedUrl },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
