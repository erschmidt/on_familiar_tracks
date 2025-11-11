# Quick Start Guide 🚀

## What This App Does

**On Familiar Tracks** analyzes your Strava running data to:
- 🗺️ Group runs on the same routes together (even with GPS variations)
- 📈 Show your progress over time on each route
- ❤️ Track metrics like heart rate and pace improvements
- 🎯 Help you see which routes you run most often

## Before You Start

You'll need:
1. ✅ A Strava account with some running activities
2. ✅ Node.js installed (download from https://nodejs.org/)
3. ✅ A few minutes to set up Strava API access

## Setup (5 minutes)

### Step 1: Install Dependencies

Open the terminal in VS Code and run:
```powershell
npm install
```

### Step 2: Get Strava API Credentials

1. Go to **https://www.strava.com/settings/api**
2. Click **"Create An App"** or use existing app
3. Fill in:
   - Application Name: `On Familiar Tracks`
   - Website: `http://localhost:3000`
   - **Authorization Callback Domain**: `localhost` (important!)
4. Save and copy your **Client ID** and **Client Secret**

### Step 3: Configure Environment

1. Copy the example file:
```powershell
Copy-Item .env.local.example .env.local
```

2. Open `.env.local` and add your credentials:
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abcdef123456
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here
```

### Step 4: Run the App

```powershell
npm run dev
```

Then open **http://localhost:3000** in your browser!

## Using the App

1. **Connect Strava**: Click the orange button and authorize the app
2. **View Routes**: Your runs will be grouped automatically
3. **Explore Progress**: Click on a route to see:
   - All runs on that route overlaid on a map
   - Progress charts showing heart rate and speed trends
   - Statistics like average distance and heart rate

## How Route Grouping Works

The app uses GPS data to identify similar routes:
- Compares the shape of GPS tracks
- Groups runs within ~500m of each other
- Handles GPS jitter and small variations
- Shows most frequently run routes first

## Customization

Want to adjust how routes are grouped?

Edit `src/utils/routeGrouping.ts` and change:
```typescript
const SIMILARITY_THRESHOLD = 500; // Lower = stricter matching
```

- **Lower value (250m)**: Routes must be very similar
- **Higher value (1000m)**: More lenient grouping

## Troubleshooting

### "npm is not recognized"
→ Install Node.js from https://nodejs.org/

### OAuth Error
→ Make sure Authorization Callback Domain is `localhost` (not `http://localhost`)

### No Activities Showing
→ Check that your Strava activities:
  - Are set to public or visible to apps
  - Include GPS data (recorded with phone/watch)
  - Are type "Run" (cycling support coming soon!)

### Map Won't Load
→ Check your internet connection (needs OpenStreetMap tiles)

## Features to Try

- ✨ See which routes you run most often
- ✨ Track if your heart rate is improving on familiar routes
- ✨ Compare your pace over time on the same route
- ✨ Discover patterns in your training

## What's Next?

Ideas for enhancement:
- Add support for cycling activities
- Export route statistics to CSV
- Set goals for specific routes
- Compare routes against each other
- Add weather data to activity history

## Need Help?

Check out:
- `SETUP.md` for detailed setup instructions
- `README.md` for technical documentation
- `.github/copilot-instructions.md` for development guidelines

---

**Ready to track your progress?** Run `npm run dev` and visit http://localhost:3000!
