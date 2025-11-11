import { Activity, GroupedRoute } from '@/types';
import { getDistance } from 'geolib';
import polyline from 'polyline';

/**
 * Group activities by similarity of their GPS tracks
 * Uses the Hausdorff distance to measure similarity between routes
 * @param activities - Array of activities to group
 * @param similarityThreshold - Maximum distance in meters for routes to be considered similar (default: 100)
 */
export function groupActivitiesByRoute(
  activities: Activity[],
  similarityThreshold: number = 100
): GroupedRoute[] {
  const runActivities = activities.filter(
    (a) => a.type === 'Run' && a.map?.summary_polyline
  );

  if (runActivities.length === 0) return [];

  const groups: GroupedRoute[] = [];

  for (const activity of runActivities) {
    let foundGroup = false;

    // Try to find an existing group this activity belongs to
    for (const group of groups) {
      const representativeActivity = group.activities[0];
      const similarity = calculateRouteSimilarity(activity, representativeActivity);

      if (similarity < similarityThreshold) {
        group.activities.push(activity);
        foundGroup = true;
        break;
      }
    }

    // If no group found, create a new one
    if (!foundGroup) {
      const centerPoint = getCenterPoint(activity);
      groups.push({
        id: `route-${groups.length}`,
        activities: [activity],
        averageDistance: activity.distance,
        averageHeartRate: activity.average_heartrate || null,
        centerPoint,
      });
    }
  }

  // Calculate statistics for each group
  groups.forEach((group) => {
    group.averageDistance =
      group.activities.reduce((sum, a) => sum + a.distance, 0) /
      group.activities.length;

    const hrActivities = group.activities.filter((a) => a.average_heartrate);
    if (hrActivities.length > 0) {
      group.averageHeartRate =
        hrActivities.reduce((sum, a) => sum + (a.average_heartrate || 0), 0) /
        hrActivities.length;
    }
  });

  // Sort groups by number of activities (most common routes first)
  return groups.sort((a, b) => b.activities.length - a.activities.length);
}

/**
 * Calculate similarity between two routes using a simplified Hausdorff distance
 * Lower values mean more similar routes
 */
function calculateRouteSimilarity(
  activity1: Activity,
  activity2: Activity
): number {
  if (!activity1.map?.summary_polyline || !activity2.map?.summary_polyline) {
    return Infinity;
  }

  const coords1 = polyline.decode(activity1.map.summary_polyline);
  const coords2 = polyline.decode(activity2.map.summary_polyline);

  // Sample points to reduce computation (every 10th point)
  const sample1 = coords1.filter((_, i) => i % 10 === 0);
  const sample2 = coords2.filter((_, i) => i % 10 === 0);

  if (sample1.length === 0 || sample2.length === 0) return Infinity;

  // Calculate average minimum distance from sample1 to sample2
  let totalDistance = 0;
  for (const point1 of sample1) {
    let minDistance = Infinity;
    for (const point2 of sample2) {
      const distance = getDistance(
        { latitude: point1[0], longitude: point1[1] },
        { latitude: point2[0], longitude: point2[1] }
      );
      minDistance = Math.min(minDistance, distance);
    }
    totalDistance += minDistance;
  }

  return totalDistance / sample1.length;
}

/**
 * Get the center point of a route
 */
function getCenterPoint(activity: Activity): [number, number] {
  if (activity.start_latlng && activity.start_latlng.length === 2) {
    return activity.start_latlng;
  }

  if (activity.map?.summary_polyline) {
    const coords = polyline.decode(activity.map.summary_polyline);
    if (coords.length > 0) {
      const midpoint = coords[Math.floor(coords.length / 2)];
      return [midpoint[0], midpoint[1]];
    }
  }

  return [0, 0];
}
