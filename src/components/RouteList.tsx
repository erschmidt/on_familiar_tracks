import { GroupedRoute } from '@/types';

interface RouteListProps {
  routes: GroupedRoute[];
  selectedRoute: GroupedRoute | null;
  onSelectRoute: (route: GroupedRoute) => void;
}

export default function RouteList({ routes, selectedRoute, onSelectRoute }: RouteListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Your Routes</h2>
      <div className="space-y-2">
        {routes.map((route, index) => (
          <button
            key={route.id}
            onClick={() => onSelectRoute(route)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              selectedRoute?.id === route.id
                ? 'bg-strava text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="font-semibold mb-1">Route {index + 1}</div>
            <div className="text-sm opacity-90">
              {route.activities.length} activities • {(route.averageDistance / 1000).toFixed(2)} km avg
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
