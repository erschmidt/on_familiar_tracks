# Data Directory

This directory contains the SQLite database for caching Strava activities.

## Files

- `activities.db` - SQLite database with cached activity data
- `activities.db-shm` - Shared memory file (SQLite)
- `activities.db-wal` - Write-ahead log (SQLite)

## Purpose

The database caches your Strava activities locally to:
- ✅ Reduce API calls to Strava
- ✅ Avoid rate limits (100 requests/15min, 1000/day)
- ✅ Speed up app loading
- ✅ Work offline with cached data

## How It Works

1. First visit: Fetches all activities from Strava and caches them
2. Subsequent visits: Loads from cache instantly
3. Auto-refresh: Syncs with Strava if cache is > 1 hour old
4. Manual refresh: Click "Sync Strava" button to force update

## Database Schema

**users** table:
- Stores access tokens and sync status

**activities** table:
- All your running activities
- GPS polylines for route mapping
- Performance metrics

**sync_log** table:
- History of sync operations
- Error tracking

## Privacy

- Database is stored locally on your computer
- Never sent to any external server
- You can delete the `.db` files anytime to clear cache

## Maintenance

To reset the cache:
```bash
# Delete the database
Remove-Item data\*.db*
```

The database will be recreated on next load.
