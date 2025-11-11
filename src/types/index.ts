export interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  kilojoules?: number;
  calories?: number;
  elev_high?: number;
  elev_low?: number;
  suffer_score?: number;
  average_temp?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
}

export interface GroupedRoute {
  id: string;
  activities: Activity[];
  averageDistance: number;
  averageHeartRate: number | null;
  centerPoint: [number, number];
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}
