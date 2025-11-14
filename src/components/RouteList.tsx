import { GroupedRoute } from '@/types';

interface RouteListProps {
  routes: GroupedRoute[];
  selectedRoute: GroupedRoute | null;
  onSelectRoute: (route: GroupedRoute) => void;
}

export default function RouteList({ routes, selectedRoute, onSelectRoute }: RouteListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Your Routes
          <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
            {routes.length}
          </span>
        </h2>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        <div className="p-2 sm:p-4 space-y-2">
          {routes.map((route, index) => (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`w-full text-left p-4 rounded-xl transition-all transform ${
                selectedRoute?.id === route.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-[1.02]'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
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
  );
}
