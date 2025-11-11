# 📱 Mobile Deployment Checklist

Follow these steps to deploy your running tracker app and use it on mobile:

## ✅ Pre-Deployment Checklist

- [ ] Code is working locally (test at http://localhost:3000)
- [ ] You have your Strava Client ID and Client Secret
- [ ] You have a GitHub account
- [ ] You have a Vercel account (or create one at vercel.com)

## 🚀 Deployment Steps

### 1. Push to GitHub (5 minutes)

```powershell
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Running tracker"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/on-familiar-tracks.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select your `on-familiar-tracks` repository
5. Click "Import"

### 3. Configure Environment Variables

Add these in Vercel:

```
NEXT_PUBLIC_STRAVA_CLIENT_ID = [Your Strava Client ID]
STRAVA_CLIENT_SECRET = [Your Strava Client Secret]
NEXT_PUBLIC_REDIRECT_URI = https://your-app.vercel.app/
```

**Note:** You'll update `NEXT_PUBLIC_REDIRECT_URI` with your actual Vercel URL after deployment.

### 4. Deploy

1. Click "Deploy"
2. Wait 1-2 minutes
3. Copy your deployment URL (e.g., `https://on-familiar-tracks-abc123.vercel.app`)

### 5. Update Strava Settings

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Under "Authorization Callback Domain", add: `your-app.vercel.app`
3. Save changes

### 6. Update Vercel Environment Variable

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_REDIRECT_URI`
3. Change to: `https://your-actual-vercel-url.vercel.app/`
4. Save
5. Go to Deployments → Click "..." → "Redeploy"

### 7. Test on Mobile 📱

1. Open your phone's browser
2. Navigate to your Vercel URL
3. Click "Connect with Strava"
4. Authorize the app
5. Start using it!

## 📲 Add to Home Screen (Optional)

**iPhone:**
1. Safari → Share button → "Add to Home Screen"
2. Name it "Running Tracker"

**Android:**
1. Chrome → Menu (⋮) → "Add to Home Screen"
2. Name it "Running Tracker"

## 🔄 Future Updates

When you make changes:
```powershell
git add .
git commit -m "Your update description"
git push
```

Vercel automatically redeploys in 1-2 minutes!

## 💡 Tips

- Use the app over WiFi for first sync (faster)
- Data is cached locally on your phone
- Works offline after first load
- Bookmark the URL for quick access

## ⚠️ Troubleshooting

**"OAuth Error"**
- Check that Vercel URL matches Strava callback domain exactly
- Ensure `NEXT_PUBLIC_REDIRECT_URI` ends with `/`

**"Build Failed"**
- Check Vercel deployment logs
- Ensure all environment variables are set

**Slow on Mobile**
- First load may be slow on cellular
- Use cache for subsequent visits
- Select shorter time range (e.g., "Last 3 Months")

## 🆓 Free Forever

Vercel free tier includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ No credit card needed

Perfect for personal use!

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
