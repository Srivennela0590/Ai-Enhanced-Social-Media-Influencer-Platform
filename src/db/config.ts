// ============================================================
// Drizzle ORM + MySQL Configuration Reference
// ============================================================
// Production database configuration for Next.js 15+
//
// Environment Variables Required:
//   DATABASE_URL=mysql://user:password@host:3306/influenceai
//   JWT_SECRET=your-super-secret-jwt-key
//   BCRYPT_SALT_ROUNDS=12
// ============================================================

/**
 * drizzle.config.ts (project root)
 * 
 * ```typescript
 * import type { Config } from 'drizzle-kit';
 * 
 * export default {
 *   schema: './src/db/schema.ts',
 *   out: './drizzle',
 *   driver: 'mysql2',
 *   dbCredentials: {
 *     uri: process.env.DATABASE_URL!,
 *   },
 *   verbose: true,
 *   strict: true,
 * } satisfies Config;
 * ```
 */

/**
 * Database Connection (src/db/index.ts)
 * 
 * ```typescript
 * import { drizzle } from 'drizzle-orm/mysql2';
 * import mysql from 'mysql2/promise';
 * import * as schema from './schema';
 * 
 * const poolConnection = mysql.createPool({
 *   uri: process.env.DATABASE_URL!,
 *   waitForConnections: true,
 *   connectionLimit: 10,
 *   maxIdle: 10,
 *   idleTimeout: 60000,
 *   queueLimit: 0,
 * });
 * 
 * export const db = drizzle(poolConnection, { schema, mode: 'default' });
 * export type DB = typeof db;
 * ```
 */

/**
 * Migration Commands:
 * 
 * Generate migrations:
 *   npx drizzle-kit generate:mysql
 * 
 * Apply migrations:
 *   npx drizzle-kit push:mysql
 * 
 * Open Drizzle Studio:
 *   npx drizzle-kit studio
 * 
 * Drop all tables:
 *   npx drizzle-kit drop
 */

export const DB_CONFIG = {
  provider: 'mysql2',
  schema: './src/db/schema.ts',
  migrationsDir: './drizzle',
  tables: [
    'users',
    'brands',
    'influencers',
    'campaigns',
    'applications',
    'collaborations',
  ],
} as const;

export default DB_CONFIG;
