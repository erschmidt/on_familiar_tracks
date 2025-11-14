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
  const [showRouteMenu, setShowRouteMenu] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-optimized header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top row: Title and main actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Burger Menu Button - Only show when routes exist */}
              {groupedRoutes.length > 0 && (
                <button
                  onClick={() => setShowRouteMenu(!showRouteMenu)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                  title="Toggle routes menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showRouteMenu ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  On Familiar Tracks
                </h1>
                {lastSync && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isCached ? '💾 Cached' : '✓ Synced'} • {new Date(lastSync).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action buttons - stacked on small screens */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium px-3 py-2 rounded-lg transition-colors shadow-sm"
                title="Sync with Strava"
              >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-2 rounded-lg transition-colors shadow-sm"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg transition-colors shadow-sm"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Second row: Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="timeRange" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Period:
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="flex-1 sm:flex-initial bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5"
              >
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            {/* Routes count badge */}
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium">
                {groupedRoutes.length} {groupedRoutes.length === 1 ? 'route' : 'routes'}
              </span>
              {isProcessing && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-medium animate-pulse">
                  ⚙️ Processing...
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Settings Panel */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Route Grouping Settings
              </h2>
              
              <div className="space-y-6">
                {/* Similarity Threshold */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="threshold" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Similarity Threshold
                    </label>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {displayThreshold}m
                    </span>
                  </div>
                  <input
                    id="threshold"
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={displayThreshold}
                    onChange={(e) => setDisplayThreshold(Number(e.target.value))}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                    style={{
                      background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${((displayThreshold - 10) / 90) * 100}%, rgb(229 231 235) ${((displayThreshold - 10) / 90) * 100}%, rgb(229 231 235) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Strict</span>
                    <span>Lenient</span>
                  </div>

                  {/* Quick Presets */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Presets:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { value: 10, label: 'Exact' },
                        { value: 30, label: 'V.Strict' },
                        { value: 50, label: 'Strict' },
                        { value: 70, label: 'Balanced' },
                        { value: 100, label: 'Lenient' }
                      ].map(preset => (
                        <button
                          key={preset.value}
                          onClick={() => {
                            setDisplayThreshold(preset.value);
                            setIsProcessing(true);
                            setTimeout(() => {
                              setSimilarityThreshold(preset.value);
                              setIsProcessing(false);
                            }, 50);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            displayThreshold === preset.value 
                              ? 'bg-blue-500 text-white shadow-md scale-105' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Minimum Activities */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="minActivities" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Minimum Activities
                    </label>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      {minActivityCount}+
                    </span>
                  </div>
                  <input
                    id="minActivities"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={minActivityCount}
                    onChange={(e) => setMinActivityCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600"
                    style={{
                      background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${((minActivityCount - 1) / 19) * 100}%, rgb(229 231 235) ${((minActivityCount - 1) / 19) * 100}%, rgb(229 231 235) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Show all</span>
                    <span>Frequent only</span>
                  </div>
                </div>

                {/* Status Info */}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Processing routes...
                  </div>
                )}
                {!isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {groupedRoutes.length} {groupedRoutes.length === 1 ? 'route' : 'routes'} found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {groupedRoutes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                No activities found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Go for a run and sync your Strava account!
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Mobile Slide-in Menu Overlay */}
            {showRouteMenu && (
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowRouteMenu(false)}
              />
            )}
            
            {/* Mobile Slide-in Route Menu */}
            <div className={`
              lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 
              transform transition-transform duration-300 ease-in-out shadow-2xl
              ${showRouteMenu ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <div className="h-full flex flex-col">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Your Routes
                  </h2>
                  <button
                    onClick={() => setShowRouteMenu(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Route List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {groupedRoutes.map((route, index) => (
                      <button
                        key={route.id}
                        onClick={() => {
                          setSelectedRoute(route);
                          setShowRouteMenu(false); // Close menu on selection
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-all transform ${
                          selectedRoute?.id === route.id
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-[1.02]'
                            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                selectedRoute?.id === route.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }`}>
                                {index + 1}
                              </span>
                              <span className={`font-semibold truncate ${
                                selectedRoute?.id === route.id
                                  ? 'text-white'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                Route {index + 1}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <div className={`flex items-center gap-1.5 ${
                                selectedRoute?.id === route.id
                                  ? 'text-white/90'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {route.activities.length} {route.activities.length === 1 ? 'run' : 'runs'}
                              </div>
                              <div className={`flex items-center gap-1.5 ${
                                selectedRoute?.id === route.id
                                  ? 'text-white/90'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                {(route.averageDistance / 1000).toFixed(2)} km
                              </div>
                              {route.averageHeartRate && (
                                <div className={`flex items-center gap-1.5 ${
                                  selectedRoute?.id === route.id
                                    ? 'text-white/90'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                  {Math.round(route.averageHeartRate)} bpm
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedRoute?.id === route.id && (
                            <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop and Content Layout */}
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Desktop Route List - Hidden on Mobile */}
              <div className="hidden lg:block lg:col-span-1">
                <RouteList
                  routes={groupedRoutes}
                  selectedRoute={selectedRoute}
                  onSelectRoute={setSelectedRoute}
                />
                </div>
            
            {/* Main Content Area - Full width on mobile, 2/3 on desktop */}
            <div className="col-span-full lg:col-span-2 space-y-4 lg:space-y-6">
              {selectedRoute && (
                <>
                  {/* Route Map Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Route Map
                      </h2>
                      <div className="h-56 sm:h-72 lg:h-96 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                        <RouteMap activities={selectedRoute.activities} />
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-3 sm:p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedRoute.activities.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {selectedRoute.activities.length === 1 ? 'Activity' : 'Activities'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-3 sm:p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {(selectedRoute.averageDistance / 1000).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            km avg
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl p-3 sm:p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedRoute.averageHeartRate ? Math.round(selectedRoute.averageHeartRate) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            bpm avg
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Chart Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Progress Over Time
                      </h2>
                      <ProgressChart activities={selectedRoute.activities} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
