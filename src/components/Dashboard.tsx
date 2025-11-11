'use client';

import { useEffect, useState } from 'react';
import RouteList from './RouteList';
import RouteMap from './RouteMap';
import ProgressChart from './ProgressChart';
import { Activity, GroupedRoute } from '@/types';
import { groupActivitiesByRoute } from '@/utils/routeGrouping';
import { 
  cacheActivities, 
  getCachedActivities, 
  isCacheValid, 
  getLastSync,
  clearCache 
} from '@/lib/cache';

interface DashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export default function Dashboard({ accessToken, onLogout }: DashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groupedRoutes, setGroupedRoutes] = useState<GroupedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<GroupedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Display threshold (updates immediately for UI responsiveness)
  const [displayThreshold, setDisplayThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('similarityThreshold');
      const savedNum = saved ? Number(saved) : 50;
      // Clamp to new max of 100
      return Math.min(savedNum, 100);
    }
    return 50;
  });
  
  // Actual threshold used for grouping (updated on slider release)
  const [similarityThreshold, setSimilarityThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('similarityThreshold');
      const savedNum = saved ? Number(saved) : 50;
      // Clamp to new max of 100
      return Math.min(savedNum, 100);
    }
    return 50;
  });
  
  const [minActivityCount, setMinActivityCount] = useState(() => {
    // Load from localStorage or use default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minActivityCount');
      return saved ? Number(saved) : 1;
    }
    return 1;
  });
  
  const [timeRange, setTimeRange] = useState<'month' | '3months' | '6months' | 'year' | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timeRange');
      return (saved as any) || 'all';
    }
    return 'all';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle slider release - update the actual threshold and trigger processing
  const handleSliderRelease = () => {
    if (displayThreshold !== similarityThreshold) {
      setIsProcessing(true);
      // Small delay to show processing indicator
      setTimeout(() => {
        setSimilarityThreshold(displayThreshold);
        setIsProcessing(false);
      }, 50);
    }
  };

  // Save similarity threshold to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('similarityThreshold', String(similarityThreshold));
    }
  }, [similarityThreshold]);

  // Save minimum activity count to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minActivityCount', String(minActivityCount));
    }
  }, [minActivityCount]);

  // Save time range to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeRange', timeRange);
    }
  }, [timeRange]);

  useEffect(() => {
    loadActivities();
  }, [accessToken, timeRange]); // Reload when timeRange changes

  useEffect(() => {
    if (activities.length > 0) {
      const allRoutes = groupActivitiesByRoute(activities, similarityThreshold);
      // Filter routes by minimum activity count
      const filteredRoutes = allRoutes.filter(route => route.activities.length >= minActivityCount);
      setGroupedRoutes(filteredRoutes);
      
      // Update selected route if it was filtered out
      if (filteredRoutes.length > 0) {
        const stillExists = filteredRoutes.find(r => r.id === selectedRoute?.id);
        if (!stillExists) {
          setSelectedRoute(filteredRoutes[0]);
        }
      } else {
        setSelectedRoute(null);
      }
    }
  }, [activities, similarityThreshold, minActivityCount]);

  const loadActivities = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    if (forceRefresh) setIsSyncing(true);
    
    try {
      // Check cache first (unless forcing refresh)
      const cacheKey = `activities_${timeRange}`;
      if (!forceRefresh && isCacheValid()) {
        const cached = getCachedActivities();
        if (cached && cached.timeRange === timeRange) {
          setActivities(cached.activities);
          setIsCached(true);
          setLastSync(cached.lastSync);
          setIsLoading(false);
          setIsSyncing(false);
          return;
        }
      }
      
      // Calculate date range
      const now = new Date();
      let afterTimestamp: number | undefined;
      
      switch (timeRange) {
        case 'month':
          afterTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime() / 1000);
          break;
        case '3months':
          afterTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime() / 1000);
          break;
        case '6months':
          afterTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime() / 1000);
          break;
        case 'year':
          afterTimestamp = Math.floor(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime() / 1000);
          break;
        case 'all':
        default:
          afterTimestamp = undefined;
      }
      
      // Fetch from Strava API
      const url = afterTimestamp 
        ? `/api/strava/activities?after=${afterTimestamp}`
        : '/api/strava/activities';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      const activities = data.activities || data;
      
      // Cache the results with timeRange
      cacheActivities(activities, timeRange);
      
      setActivities(activities);
      setIsCached(false);
      setLastSync(data.lastSync || new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Try to load from cache if fetch failed
      const cached = getCachedActivities();
      if (cached) {
        setActivities(cached.activities);
        setIsCached(true);
        setLastSync(cached.lastSync);
        setError('Failed to sync with Strava. Showing cached data.');
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleRefresh = () => {
    loadActivities(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-strava mx-auto mb-4"></div>
          <p className="text-xl">Loading your activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadActivities()}
            className="bg-strava hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">On Familiar Tracks</h1>
          {lastSync && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isCached ? '💾 Cached data' : '✓ Synced'} • Last updated: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="timeRange" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Load:
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-strava focus:border-strava block px-3 py-2"
            >
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="all">Everything</option>
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync Strava'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <button
            onClick={onLogout}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Route Grouping Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <span className="font-semibold">Similarity Threshold: {displayThreshold}m</span>
                {isProcessing && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2 animate-pulse">
                    ⚙️ Processing...
                  </span>
                )}
                {!isProcessing && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({groupedRoutes.length} routes found)
                  </span>
                )}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={displayThreshold}
                onChange={(e) => setDisplayThreshold(Number(e.target.value))}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>10m (Exact matches)</span>
                <span>100m (Loose matching)</span>
              </div>
            </div>
            
            {/* Preset Buttons */}
            <div>
              <p className="text-sm font-semibold mb-2">Quick Presets:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setDisplayThreshold(10);
                    setIsProcessing(true);
                    setTimeout(() => {
                      setSimilarityThreshold(10);
                      setIsProcessing(false);
                    }, 50);
                  }}
                  className={`px-3 py-1 rounded text-sm ${displayThreshold === 10 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Exact (10m)
                </button>
                <button
                  onClick={() => {
                    setDisplayThreshold(30);
                    setIsProcessing(true);
                    setTimeout(() => {
                      setSimilarityThreshold(30);
                      setIsProcessing(false);
                    }, 50);
                  }}
                  className={`px-3 py-1 rounded text-sm ${displayThreshold === 30 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Very Strict (30m)
                </button>
                <button
                  onClick={() => {
                    setDisplayThreshold(50);
                    setIsProcessing(true);
                    setTimeout(() => {
                      setSimilarityThreshold(50);
                      setIsProcessing(false);
                    }, 50);
                  }}
                  className={`px-3 py-1 rounded text-sm ${displayThreshold === 50 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Strict (50m)
                </button>
                <button
                  onClick={() => {
                    setDisplayThreshold(70);
                    setIsProcessing(true);
                    setTimeout(() => {
                      setSimilarityThreshold(70);
                      setIsProcessing(false);
                    }, 50);
                  }}
                  className={`px-3 py-1 rounded text-sm ${displayThreshold === 70 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Balanced (70m)
                </button>
                <button
                  onClick={() => {
                    setDisplayThreshold(100);
                    setIsProcessing(true);
                    setTimeout(() => {
                      setSimilarityThreshold(100);
                      setIsProcessing(false);
                    }, 50);
                  }}
                  className={`px-3 py-1 rounded text-sm ${displayThreshold === 100 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Relaxed (100m)
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Start with a low value (10-30m) for exact matches. If you get too many separate routes, gradually increase the threshold.<br /><br />
                <strong>Current setting:</strong> Routes will be grouped if they are within <strong>{displayThreshold} meters</strong> of each other.
              </p>
            </div>

            {/* Activity Count Filter */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block mb-2">
                <span className="font-semibold">Minimum Activities per Route: {minActivityCount}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  (Showing routes with at least {minActivityCount} {minActivityCount === 1 ? 'activity' : 'activities'})
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={minActivityCount}
                onChange={(e) => setMinActivityCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>1 (Show all routes)</span>
                <span>20 (Frequently-run only)</span>
              </div>
            </div>

            {/* Activity Count Presets */}
            <div>
              <p className="text-sm font-semibold mb-2">Quick Filters:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setMinActivityCount(1)}
                  className={`px-3 py-1 rounded text-sm ${minActivityCount === 1 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  All (1+)
                </button>
                <button
                  onClick={() => setMinActivityCount(2)}
                  className={`px-3 py-1 rounded text-sm ${minActivityCount === 2 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Regular (2+)
                </button>
                <button
                  onClick={() => setMinActivityCount(3)}
                  className={`px-3 py-1 rounded text-sm ${minActivityCount === 3 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Common (3+)
                </button>
                <button
                  onClick={() => setMinActivityCount(5)}
                  className={`px-3 py-1 rounded text-sm ${minActivityCount === 5 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Frequent (5+)
                </button>
                <button
                  onClick={() => setMinActivityCount(10)}
                  className={`px-3 py-1 rounded text-sm ${minActivityCount === 10 ? 'bg-strava text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  Very Frequent (10+)
                </button>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-strava">{activities.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-strava">{groupedRoutes.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unique Routes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-strava">
                  {groupedRoutes.length > 0 ? (activities.length / groupedRoutes.length).toFixed(1) : '0'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Runs/Route</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {groupedRoutes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No activities found. Go for a run and sync your Strava account!
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RouteList
              routes={groupedRoutes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {selectedRoute && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Route Map
                  </h2>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <RouteMap activities={selectedRoute.activities} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{selectedRoute.activities.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {(selectedRoute.averageDistance / 1000).toFixed(2)} km
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Distance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {selectedRoute.averageHeartRate ? Math.round(selectedRoute.averageHeartRate) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Heart Rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Progress Over Time
                  </h2>
                  <ProgressChart activities={selectedRoute.activities} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
