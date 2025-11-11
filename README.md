# On Familiar Tracks

A web application that helps runners track their progress on familiar routes by analyzing Strava activity data.

## Features

- 🏃 **Connect to Strava**: Securely authenticate with your Strava account
- 🗺️ **Route Grouping**: Automatically groups similar GPS tracks together using intelligent algorithms
- 📈 **Progress Visualization**: Track your improvement over time with interactive charts
- 🗺️ **Interactive Maps**: View all your runs on the same route overlaid on a map
- 📊 **Metrics Tracking**: Monitor heart rate, speed, and other performance metrics
- 💾 **Smart Caching**: SQLite database caches activities locally for instant loading
- 🔄 **Auto-Sync**: Intelligently syncs with Strava to avoid API rate limits
- ⚙️ **Customizable Grouping**: Adjust route similarity threshold to match your preferences

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A Strava account
- Strava API credentials (get them at https://www.strava.com/settings/api)

### Installation

1. Clone the repository and navigate to the project folder:
```bash
cd on_familiar_tracks
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Strava API credentials:
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here
```

To get your Strava API credentials:
- Go to https://www.strava.com/settings/api
- Create a new application
- Set the Authorization Callback Domain to `localhost`
- Copy the Client ID and Client Secret

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Route Grouping Algorithm

The application uses a sophisticated GPS track similarity algorithm to group your runs:

1. **Data Collection**: Fetches your running activities from Strava
2. **Route Comparison**: Uses a modified Hausdorff distance to compare GPS tracks
3. **Clustering**: Groups activities with similar routes together (within ~500m tolerance)
4. **Visualization**: Displays all runs on the same route with progress metrics

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet for interactive route visualization
- **Charts**: Chart.js for progress tracking
- **GPS Processing**: Polyline encoding/decoding, Geolib for distance calculations

## Project Structure

```
on_familiar_tracks/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── exchange/      # Token exchange endpoint
│   │   │   └── strava/
│   │   │       └── activities/    # Fetch Strava activities
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Main page
│   │   └── globals.css
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard component
│   │   ├── StravaConnect.tsx      # Strava OAuth connection
│   │   ├── RouteList.tsx          # List of grouped routes
│   │   ├── RouteMap.tsx           # Leaflet map component
│   │   └── ProgressChart.tsx      # Chart.js visualization
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── routeGrouping.ts       # Route grouping algorithm
├── public/
├── .env.local.example
└── package.json
```

## Features Explained

### Route Similarity Detection

The app uses a multi-step process to determine if two runs are on the same route:

1. Decodes the polyline GPS data from Strava
2. Samples points from each route (every 10th point for performance)
3. Calculates the average minimum distance between corresponding points
4. Groups routes with similarity scores below the threshold (~500m)

### Progress Tracking

For each grouped route, the app displays:
- Number of times you've run the route
- Average distance
- Average heart rate
- Speed trends over time
- Heart rate trends over time

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Your Strava application client ID | Yes |
| `STRAVA_CLIENT_SECRET` | Your Strava application client secret | Yes |
| `NEXT_PUBLIC_REDIRECT_URI` | OAuth redirect URI (usually `http://localhost:3000` for dev) | Yes |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Yes |

## Troubleshooting

### No activities showing up
- Make sure your Strava activities are set to public or visible to the app
- Check that your activities have GPS data (map polylines)
- Verify your access token is valid

### Routes not grouping correctly
- Adjust the `SIMILARITY_THRESHOLD` in `src/utils/routeGrouping.ts`
- Lower values = stricter matching (routes must be more similar)
- Higher values = looser matching (more routes grouped together)

### Map not loading
- Ensure you have an internet connection for OpenStreetMap tiles
- Check browser console for JavaScript errors
- Verify Leaflet CSS is properly imported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Strava API for activity data
- OpenStreetMap for map tiles
- Chart.js for visualization
- Leaflet for mapping
