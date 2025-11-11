# Setup Instructions

Follow these steps to get the project running:

## 1. Install Node.js

If you don't have Node.js installed:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Install and restart your terminal/VS Code
3. Verify installation: `node --version` and `npm --version`

## 2. Install Dependencies

In the VS Code terminal (PowerShell), run:
```powershell
npm install
```

This will install all required packages including:
- Next.js framework
- React and React DOM
- Leaflet (for maps)
- Chart.js (for charts)
- TypeScript and type definitions
- Tailwind CSS
- And other utilities

## 3. Set Up Strava API Credentials

### Create a Strava API Application

1. Go to https://www.strava.com/settings/api
2. Create a new application with these settings:
   - **Application Name**: On Familiar Tracks (or your preferred name)
   - **Category**: Training
   - **Website**: http://localhost:3000
   - **Authorization Callback Domain**: localhost
3. After creation, you'll see your **Client ID** and **Client Secret**

### Configure Environment Variables

1. Copy the example environment file:
```powershell
Copy-Item .env.local.example .env.local
```

2. Edit `.env.local` and add your Strava credentials:
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXTAUTH_SECRET=any_random_string_here
```

For `NEXTAUTH_SECRET`, you can generate a random string or use:
```powershell
# Generate a random secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }) -as [byte[]])
```

## 4. Run the Development Server

```powershell
npm run dev
```

The application will start at http://localhost:3000

## 5. Connect Your Strava Account

1. Open http://localhost:3000 in your browser
2. Click "Connect with Strava"
3. Authorize the application
4. You'll be redirected back and your activities will be loaded!

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in your PATH
- Solution: Install Node.js from https://nodejs.org/

### Dependencies installation fails
- Try deleting `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Strava OAuth errors
- Check that your Authorization Callback Domain is set to `localhost` (not `http://localhost`)
- Verify your Client ID and Secret are correct in `.env.local`
- Make sure `.env.local` is in the root directory

### No activities showing
- Ensure your Strava activities have GPS data
- Check that you've authorized the app to read your activities
- Only "Run" type activities are shown by default

### Map not loading
- Check your internet connection (map tiles come from OpenStreetMap)
- Look for errors in the browser console (F12)

## Next Steps

After setup, you can:
- Adjust the route grouping sensitivity in `src/utils/routeGrouping.ts`
- Customize the UI colors in `tailwind.config.ts`
- Add more metrics to track in the charts
- Extend to support cycling or other activity types

## Production Deployment

To build for production:
```powershell
npm run build
npm start
```

For deployment to Vercel, Netlify, or other platforms, update the `NEXT_PUBLIC_REDIRECT_URI` to your production URL and update the Strava API settings accordingly.
