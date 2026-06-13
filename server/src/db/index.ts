// ============================================================
// Database Connection — Drizzle ORM + MySQL2
// ============================================================

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/influenceai';

const pool = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool, { schema, mode: 'default' });
export type DB = typeof db;
export { schema };
export default db;
