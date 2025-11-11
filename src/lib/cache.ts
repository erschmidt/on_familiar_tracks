/**
 * Browser-compatible activity cache using localStorage
 * Lightweight alternative to server-side database
 */

import { Activity } from '@/types';

const CACHE_KEY = 'strava_activities_cache';
const LAST_SYNC_KEY = 'strava_last_sync';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface CachedData {
  activities: Activity[];
  lastSync: string;
  athleteId?: string;
  timeRange?: string;
}

/**
 * Save activities to localStorage
 */
export function cacheActivities(activities: Activity[], timeRange?: string, athleteId?: string): void {
  try {
    const data: CachedData = {
      activities,
      lastSync: new Date().toISOString(),
      athleteId,
      timeRange,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_SYNC_KEY, data.lastSync);
  } catch (error) {
    console.error('Failed to cache activities:', error);
  }
}

/**
 * Get cached activities
 */
export function getCachedActivities(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    return JSON.parse(cached) as CachedData;
  } catch (error) {
    console.error('Failed to retrieve cached activities:', error);
    return null;
  }
}

/**
 * Check if cache is still valid (less than 1 hour old)
 */
export function isCacheValid(): boolean {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  if (!lastSync) return false;
  
  const lastSyncTime = new Date(lastSync).getTime();
  const now = new Date().getTime();
  const age = now - lastSyncTime;
  
  return age < CACHE_DURATION;
}

/**
 * Get last sync time
 */
export function getLastSync(): Date | null {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? new Date(lastSync) : null;
}

/**
 * Clear cache
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  cached: boolean;
  count: number;
  age: number;
  lastSync: Date | null;
} {
  const data = getCachedActivities();
  const lastSync = getLastSync();
  
  if (!data || !lastSync) {
    return {
      cached: false,
      count: 0,
      age: 0,
      lastSync: null,
    };
  }
  
  const age = new Date().getTime() - lastSync.getTime();
  
  return {
    cached: true,
    count: data.activities.length,
    age: Math.floor(age / 1000 / 60), // age in minutes
    lastSync,
  };
}
