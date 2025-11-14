'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';

function HomeContent() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('strava_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
      setIsLoading(false);

      // Check if we just got redirected back from Strava
      const code = searchParams.get('code');
      if (code && !storedToken) {
        exchangeToken(code);
      }
    }
  }, [searchParams]);

  const exchangeToken = async (code: string) => {
    try {
      const response = await fetch('/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('strava_access_token', data.access_token);
        localStorage.setItem('strava_refresh_token', data.refresh_token);
        setAccessToken(data.access_token);
        window.history.replaceState({}, '', '/');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_refresh_token');
    setAccessToken(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            Loading your journey...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {!accessToken ? (
        <StravaConnect />
      ) : (
        <Dashboard accessToken={accessToken} onLogout={handleLogout} />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            Loading your journey...
          </p>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
