# Deployment Guide - On Familiar Tracks

This guide will walk you through deploying your running tracker app to Vercel so you can access it from any device, including your mobile phone.

## Prerequisites

- A GitHub account (free)
- A Vercel account (free) - sign up at [vercel.com](https://vercel.com)
- Your Strava API credentials (you already have these in `.env.local`)

## Step 1: Push Your Code to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new)
   - Name it `on-familiar-tracks` (or any name you prefer)
   - Make it **Public** or **Private** (your choice)
   - Do NOT initialize with README (we already have code)
   - Click "Create repository"

2. **Initialize git in your project** (if not already done):
   ```powershell
   cd C:\Users\Eric\on_familiar_tracks
   git init
   git add .
   git commit -m "Initial commit - Running tracker with Strava integration"
   ```

3. **Push to GitHub:**
   ```powershell
   # Replace YOUR_USERNAME with your GitHub username
   git remote add origin https://github.com/YOUR_USERNAME/on-familiar-tracks.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Repository:**
   - Click "Add New..." → "Project"
   - Find and select your `on-familiar-tracks` repository
   - Click "Import"

3. **Configure Your Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

4. **Add Environment Variables:**
   Click "Environment Variables" and add these THREE variables:
   
   - **Name:** `NEXT_PUBLIC_STRAVA_CLIENT_ID`
     **Value:** [Your Strava Client ID from .env.local]
   
   - **Name:** `STRAVA_CLIENT_SECRET`
     **Value:** [Your Strava Client Secret from .env.local]
   
   - **Name:** `NEXT_PUBLIC_REDIRECT_URI`
     **Value:** `https://YOUR_APP_NAME.vercel.app/` 
     *(You'll update this in Step 3)*

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Wait 1-2 minutes for deployment to complete
   - You'll get a URL like `https://on-familiar-tracks-abc123.vercel.app`

## Step 3: Update Strava OAuth Settings

Your Vercel URL needs to be registered with Strava:

1. **Go to your Strava API settings:**
   - Visit [strava.com/settings/api](https://www.strava.com/settings/api)

2. **Update Authorization Callback Domain:**
   - Add your Vercel domain (without https://): `your-app-name.vercel.app`
   - Keep `localhost` for local development

3. **Update Vercel Environment Variable:**
   - Go back to Vercel Dashboard
   - Click on your project
   - Go to "Settings" → "Environment Variables"
   - Edit `NEXT_PUBLIC_REDIRECT_URI`
   - Change it to: `https://your-actual-vercel-url.vercel.app/`
   - Click "Save"
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

## Step 4: Access on Mobile

1. **Open your browser on your phone** (Safari, Chrome, Firefox, etc.)
2. **Navigate to your Vercel URL**
3. **Add to Home Screen** (optional but recommended):
   
   **iOS (Safari):**
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Name it "Running Tracker" or similar
   - Tap "Add"
   
   **Android (Chrome):**
   - Tap the three dots menu
   - Tap "Add to Home Screen"
   - Name it "Running Tracker"
   - Tap "Add"

4. **Connect to Strava** and start using the app!

## Custom Domain (Optional)

If you want a custom domain like `running.yourdomain.com`:

1. Buy a domain from any provider (Namecheap, Google Domains, etc.)
2. In Vercel Dashboard:
   - Go to your project → "Settings" → "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions
3. Update Strava OAuth callback to use your custom domain

## Troubleshooting

### "OAuth Error" or "Invalid Redirect URI"
- Make sure `NEXT_PUBLIC_REDIRECT_URI` in Vercel matches your actual URL
- Ensure the callback domain is registered in Strava settings
- URLs must match EXACTLY (including trailing slash or not)

### "Application Error" or Build Failed
- Check the Vercel deployment logs
- Ensure all environment variables are set
- Make sure there are no TypeScript errors locally

### Strava API Rate Limits
- Free tier: 100 requests per 15 minutes, 1,000 per day
- The app caches data for 1 hour to minimize API calls
- If you hit limits, wait 15 minutes before syncing again

### Mobile Performance
- The app uses localStorage for caching
- First load may be slower on mobile networks
- Subsequent visits load from cache (very fast)
- Use WiFi for initial sync if you have many activities

## Updating Your App

When you make changes to your code:

```powershell
git add .
git commit -m "Description of changes"
git push
```

Vercel automatically detects the push and redeploys your app (takes 1-2 minutes).

## Free Tier Limits

Vercel Free Tier includes:
- Unlimited deployments
- 100 GB bandwidth per month
- Automatic HTTPS
- No credit card required

This is more than enough for personal use!

## Security Notes

- Never commit `.env.local` to GitHub (it's already in `.gitignore`)
- Keep your `STRAVA_CLIENT_SECRET` private
- Only share your app URL with trusted people
- Consider making your GitHub repo private if you're concerned

## Support

If you run into issues:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Strava API Docs: [developers.strava.com](https://developers.strava.com)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**That's it! Your app is now live and accessible from anywhere. 🎉**
