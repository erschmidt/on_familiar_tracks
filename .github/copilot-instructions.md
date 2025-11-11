<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# On Familiar Tracks - Project Guidelines

## Project Overview
This is a Next.js web application that integrates with the Strava API to analyze running activities, group similar GPS tracks, and visualize progress over time.

## Tech Stack
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for styling
- Leaflet for interactive maps
- Chart.js for data visualization
- Strava API for activity data

## Code Style Guidelines

### TypeScript
- Always use TypeScript with strict type checking
- Define interfaces in `src/types/index.ts`
- Avoid using `any` types
- Use proper type annotations for function parameters and return values

### React Components
- Use functional components with hooks
- Mark client-side components with `'use client'` directive
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks or utility functions

### API Routes
- Place API routes in `src/app/api/`
- Use proper error handling with try-catch blocks
- Return appropriate HTTP status codes
- Validate request data before processing

### Styling
- Use Tailwind CSS utility classes
- Follow the existing color scheme (Strava orange: #FC4C02)
- Ensure responsive design for mobile devices
- Use dark mode compatible classes

### GPS and Route Processing
- All GPS coordinates use [latitude, longitude] format
- Use the `polyline` library for encoding/decoding GPS tracks
- Distance calculations use the `geolib` library
- Route similarity threshold is configurable in `routeGrouping.ts`

## Environment Variables
- Never commit `.env.local` files
- Update `.env.local.example` when adding new variables
- Use `NEXT_PUBLIC_` prefix for client-accessible variables
- Keep Strava credentials secure

## API Integration
- Strava API base URL: `https://www.strava.com/api/v3/`
- OAuth flow: Authorization Code with PKCE
- Token refresh should be handled when access token expires
- Rate limits: Be mindful of Strava API rate limits (100 requests per 15 minutes, 1000 per day)

## Performance Considerations
- Limit the number of activities fetched (currently 200)
- Sample GPS points for route comparison (every 10th point)
- Use React.memo for expensive components
- Lazy load map and chart libraries when possible

## Testing
- Test route grouping with activities of varying similarity
- Verify OAuth flow in both development and production
- Check responsive design on mobile devices
- Test with accounts that have many activities

## Common Patterns

### Fetching Strava Data
```typescript
const response = await fetch('/api/strava/activities', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### Error Handling
```typescript
try {
  // API call
} catch (error) {
  console.error('Error description:', error);
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  );
}
```

### Route Grouping
- Adjust `SIMILARITY_THRESHOLD` in `routeGrouping.ts` to tune grouping sensitivity
- Lower threshold = stricter matching
- Higher threshold = more lenient matching

## Future Enhancements
- Add pagination for activities
- Implement token refresh mechanism
- Add filters for date ranges and activity types
- Export route data and statistics
- Compare performance between different time periods
- Add elevation profile visualization
- Support for other activity types (cycling, hiking, etc.)
