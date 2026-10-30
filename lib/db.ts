import mysql, { type Pool, type ResultSetHeader } from 'mysql2/promise';
import { randomUUID } from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __ybPool: Pool | undefined;
}

function createPool(): Pool {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
    charset: 'utf8mb4',
    // Make MySQL rows look like the JSON-style rows the UI expects (booleans, ISO dates, parsed JSON).
    typeCast(field: any, next: () => unknown) {
      if (field.type === 'TINY' && field.length === 1) {
        const v = field.string();
        return v === null ? null : v === '1';
      }
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        const v = field.string();
        return v ? new Date(v.replace(' ', 'T') + 'Z').toISOString() : null;
      }
      if (field.type === 'JSON') {
        const v = field.string();
        if (!v) return null;
        try {
          return JSON.parse(v);
        } catch {
          return null;
        }
      }
      return next();
    },
  });
  // All timestamps are read and written as UTC.
  pool.on('connection', (conn: any) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return pool;
}

export function getPool(): Pool {
  return (globalThis.__ybPool ??= createPool());
}

const clean = (params: unknown[]) => params.map((v) => (v === undefined ? null : v));

export async function query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, clean(params));
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [res] = await getPool().query<ResultSetHeader>(sql, clean(params));
  return res;
}

export const uuid = () => randomUUID();

/** 'YYYY-MM-DD HH:MM:SS' in UTC, for DATETIME columns */
export const toSqlDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
