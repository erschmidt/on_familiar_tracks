import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Activity } from '@/types';

let db: Database.Database | null = null;

/**
 * Get or create the SQLite database instance
 */
function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'activities.db');
    db = new Database(dbPath);
    initializeDb(db);
  }
  return db;
}

/**
 * Initialize database tables
 */
function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      strava_id INTEGER PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      last_sync DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY,
      strava_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      distance REAL NOT NULL,
      moving_time INTEGER NOT NULL,
      elapsed_time INTEGER NOT NULL,
      total_elevation_gain REAL,
      type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      start_date_local TEXT NOT NULL,
      timezone TEXT,
      average_speed REAL,
      max_speed REAL,
      average_heartrate REAL,
      max_heartrate REAL,
      elev_high REAL,
      elev_low REAL,
      map_polyline TEXT,
      raw_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (strava_id) REFERENCES users(strava_id),
      UNIQUE(id, strava_id)
    );

    CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);
    CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
    CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strava_id INTEGER NOT NULL,
      sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      activities_fetched INTEGER,
      success BOOLEAN,
      error_message TEXT,
      FOREIGN KEY (strava_id) REFERENCES users(strava_id)
    );
  `);
}

/**
 * Save or update user information
 */
export function saveUser(stravaId: number, accessToken: string, refreshToken: string, expiresAt: number) {
  const database = getDb();
  
  const stmt = database.prepare(`
    INSERT INTO users (strava_id, access_token, refresh_token, expires_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(strava_id) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  stmt.run(stravaId, accessToken, refreshToken, expiresAt);
}

/**
 * Get user by Strava ID
 */
export function getUser(stravaId: number) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM users WHERE strava_id = ?');
  return stmt.get(stravaId) as any;
}

/**
 * Save activities to database
 */
export function saveActivities(stravaId: number, activities: Activity[]) {
  const database = getDb();
  
  const stmt = database.prepare(`
    INSERT INTO activities (
      id, strava_id, name, distance, moving_time, elapsed_time,
      total_elevation_gain, type, start_date, start_date_local,
      timezone, average_speed, max_speed, average_heartrate,
      max_heartrate, elev_high, elev_low, map_polyline, raw_data
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id, strava_id) DO UPDATE SET
      name = excluded.name,
      distance = excluded.distance,
      moving_time = excluded.moving_time,
      elapsed_time = excluded.elapsed_time,
      total_elevation_gain = excluded.total_elevation_gain,
      average_speed = excluded.average_speed,
      max_speed = excluded.max_speed,
      average_heartrate = excluded.average_heartrate,
      max_heartrate = excluded.max_heartrate,
      elev_high = excluded.elev_high,
      elev_low = excluded.elev_low,
      map_polyline = excluded.map_polyline,
      raw_data = excluded.raw_data
  `);

  const insertMany = database.transaction((activities: Activity[]) => {
    for (const activity of activities) {
      stmt.run(
        activity.id,
        stravaId,
        activity.name,
        activity.distance,
        activity.moving_time,
        activity.elapsed_time,
        activity.total_elevation_gain || 0,
        activity.type,
        activity.start_date,
        activity.start_date_local,
        activity.timezone || null,
        activity.average_speed,
        activity.max_speed,
        activity.average_heartrate || null,
        activity.max_heartrate || null,
        activity.elev_high || null,
        activity.elev_low || null,
        activity.map?.summary_polyline || null,
        JSON.stringify(activity)
      );
    }
  });

  insertMany(activities);
}

/**
 * Get all activities for a user
 */
export function getActivities(stravaId: number, type?: string): Activity[] {
  const database = getDb();
  
  let query = 'SELECT raw_data FROM activities WHERE strava_id = ?';
  const params: any[] = [stravaId];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY start_date DESC';
  
  const stmt = database.prepare(query);
  const rows = stmt.all(...params) as any[];
  
  return rows.map(row => JSON.parse(row.raw_data));
}

/**
 * Update last sync time
 */
export function updateLastSync(stravaId: number) {
  const database = getDb();
  const stmt = database.prepare('UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE strava_id = ?');
  stmt.run(stravaId);
}

/**
 * Get last sync time
 */
export function getLastSync(stravaId: number): Date | null {
  const database = getDb();
  const stmt = database.prepare('SELECT last_sync FROM users WHERE strava_id = ?');
  const result = stmt.get(stravaId) as any;
  
  return result?.last_sync ? new Date(result.last_sync) : null;
}

/**
 * Log sync operation
 */
export function logSync(stravaId: number, activitiesFetched: number, success: boolean, errorMessage?: string) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO sync_log (strava_id, activities_fetched, success, error_message)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(stravaId, activitiesFetched, success ? 1 : 0, errorMessage || null);
}

/**
 * Check if we need to sync (last sync > 1 hour ago or never synced)
 */
export function shouldSync(stravaId: number, maxAgeMinutes: number = 60): boolean {
  const lastSync = getLastSync(stravaId);
  
  if (!lastSync) return true;
  
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
  
  return diffMinutes > maxAgeMinutes;
}

/**
 * Get activity statistics
 */
export function getActivityStats(stravaId: number) {
  const database = getDb();
  
  const stmt = database.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN type = 'Run' THEN 1 END) as runs,
      SUM(CASE WHEN type = 'Run' THEN distance ELSE 0 END) as total_distance,
      AVG(CASE WHEN type = 'Run' AND average_heartrate IS NOT NULL THEN average_heartrate END) as avg_hr
    FROM activities
    WHERE strava_id = ?
  `);
  
  return stmt.get(stravaId);
}

/**
 * Close database connection (call on app shutdown)
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
