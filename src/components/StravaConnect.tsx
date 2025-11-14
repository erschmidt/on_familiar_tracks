export default function StravaConnect() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const scope = 'read,activity:read_all';
    
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            On Familiar Tracks
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your progress on familiar running routes
          </p>
        </div>
        
        {/* Features Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              How it works
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl">
                <div className="text-5xl mb-4">🏃</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  Connect Strava
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Import your running activities with one click
                </p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  Smart Grouping
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI groups similar GPS tracks automatically
                </p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  Track Progress
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Visualize improvement with interactive charts
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 sm:p-8">
            <button
              onClick={handleConnect}
              className="w-full bg-white hover:bg-gray-50 text-orange-600 font-bold py-4 px-6 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              <span>Connect with Strava</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-center text-white/90 text-xs sm:text-sm mt-4">
              🔒 Secure OAuth connection • Read-only access • Your data stays with Strava
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Made for runners who want to track their improvement on favorite routes
        </p>
      </div>
    </div>
  );
}
