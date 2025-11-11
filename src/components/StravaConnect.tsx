export default function StravaConnect() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const scope = 'read,activity:read_all';
    
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">On Familiar Tracks</h1>
      <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
        Track your progress on familiar running routes
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="p-4">
            <div className="text-3xl mb-2">🏃</div>
            <h3 className="font-semibold mb-2">1. Connect Strava</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Strava account to import your activities
            </p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold mb-2">2. Identify Routes</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our algorithm groups similar GPS tracks together
            </p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold mb-2">3. Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize your improvement over time with charts
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleConnect}
        className="bg-strava hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors flex items-center justify-center mx-auto gap-2"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </button>
    </div>
  );
}
