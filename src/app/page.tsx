'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function HomeContent() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
