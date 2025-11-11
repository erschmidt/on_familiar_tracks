# Troubleshooting "Page Not Found" Error

## Quick Fix Steps

### 1. Start the Development Server

The app needs to be running! In VS Code terminal (or PowerShell):

```powershell
npm run dev
```

Or double-click `start.bat` in the project folder.

Wait until you see:
```
✓ Ready in X.XXs
○ Local: http://localhost:3000
```

### 2. Open the Correct URL

Visit: **http://localhost:3000** (not https, not a different port)

### 3. Check for Errors

Look in the terminal for any error messages. Common issues:

#### "Port 3000 is already in use"
Another app is using port 3000.

**Solution:**
```powershell
# Kill the process using port 3000
netstat -ano | findstr :3000
# Note the PID (last number)
taskkill /PID <PID> /F
# Then run npm run dev again
```

Or use a different port:
```powershell
$env:PORT=3001; npm run dev
```

#### "Module not found" errors
Dependencies aren't installed properly.

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### Build errors
The Next.js build might have failed.

**Solution:**
```powershell
# Clear Next.js cache and rebuild
Remove-Item -Recurse -Force .next
npm run dev
```

### 4. Verify Files Are Correct

Make sure these files exist:
- ✅ `src/app/page.tsx` - Main page
- ✅ `src/app/layout.tsx` - Layout
- ✅ `.env.local` - Environment variables

### 5. Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors.

Common browser errors:

**"Failed to fetch"**
- Server isn't running
- Wrong URL (must be http://localhost:3000)

**OAuth/Strava errors**
- Check `.env.local` has correct Strava credentials
- Verify Strava app callback domain is `localhost`

## Still Not Working?

### Step-by-Step Reset

1. **Stop any running servers** (Ctrl+C in terminal)

2. **Clear everything:**
```powershell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

3. **Reinstall:**
```powershell
npm install
```

4. **Verify environment:**
Check `.env.local` exists and has:
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=185036
STRAVA_CLIENT_SECRET=007a8bc377ba6f8548c4b668931fd3c690314d46
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_12345
```

5. **Start fresh:**
```powershell
npm run dev
```

6. **Visit http://localhost:3000**

## Common Mistakes

❌ Visiting https://localhost:3000 (should be **http**)
❌ Server not running (you must run `npm run dev` first)
❌ Wrong port (check the terminal output for the correct port)
❌ Missing dependencies (run `npm install`)
❌ Firewall blocking localhost (check Windows Firewall)

## Check Server Status

The terminal should show:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

If you see this, the server is running correctly!

## Testing Checklist

- [ ] Node.js is installed (`node --version` works)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env.local` file exists with Strava credentials
- [ ] Development server is running (`npm run dev`)
- [ ] Terminal shows "Ready" message
- [ ] Browser is at http://localhost:3000 (http, not https)
- [ ] No errors in browser console (F12)

## Get More Help

If still having issues:

1. **Check the terminal output** - copy any error messages
2. **Check browser console** (F12) - look for red errors
3. **Verify file structure** - compare with PROJECT_SUMMARY.md

### Share This Info:
- What error message do you see?
- What's in the terminal when you run `npm run dev`?
- What's in the browser console (F12)?
- What URL are you visiting?

## Quick Test

Run this in PowerShell to test your setup:
```powershell
# Test Node.js
node --version

# Test npm
npm --version

# Check if server is running
Test-NetConnection -ComputerName localhost -Port 3000
```

If all three work, the server should be accessible at http://localhost:3000!
