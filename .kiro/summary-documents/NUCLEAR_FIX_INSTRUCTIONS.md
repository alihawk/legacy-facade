# NUCLEAR FIX - Complete Cache Clear

## The Problem
Your browser is aggressively caching the old JavaScript files. Even after restarting the dev server, it's serving cached versions.

## The Solution
Complete cache clear and fresh build.

## Step-by-Step Instructions

### 1. Stop Dev Server
In your terminal where the frontend is running, press:
- **Ctrl+C** (or Cmd+C on Mac)

### 2. Clear ALL Caches
```bash
cd frontend

# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist folder
rm -rf dist

# Clear browser cache (we'll do this in browser too)
```

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Clear Browser Cache (IMPORTANT!)

#### Option A: Hard Reload (Try this first)
1. Open DevTools (F12 or Cmd+Option+I)
2. **Right-click** the refresh button (next to address bar)
3. Select **"Empty Cache and Hard Reload"**

#### Option B: Clear Site Data (If Option A doesn't work)
1. Open DevTools (F12)
2. Go to **Application** tab
3. In left sidebar, click **"Storage"**
4. Click **"Clear site data"** button
5. Refresh page

#### Option C: Incognito/Private Mode (Nuclear option)
1. Open a **new incognito/private window**
2. Navigate to `http://localhost:5173` (or whatever port)
3. Test if buttons are visible

### 5. Verify the Fix

After clearing cache, you should see:

**Modal Buttons:**
- Cancel button: White background with gray text
- Save Token button: Purple gradient with white text

**If you STILL see white buttons:**
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for any errors (red text)
4. Go to **Network** tab
5. Refresh page
6. Look for any failed requests (red)
7. Take a screenshot and share

### 6. Alternative: Check Compiled Code

If nothing works, let's verify the code is actually being compiled:

```bash
cd frontend
npm run build
```

Then check if there are errors in the build output.

## Why This Happens

Vite uses aggressive caching for performance. Sometimes when you make changes to component files, the cache doesn't invalidate properly, especially with:
- Inline styles
- Component props
- CSS-in-JS

## Last Resort

If NOTHING works after all this:

1. **Check if backend is running**: The deploy feature needs the backend
   ```bash
   # In another terminal
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Try a different browser**: Sometimes one browser caches more aggressively

3. **Check the actual compiled code**:
   - Open DevTools
   - Go to Sources tab
   - Find the VercelTokenModal file
   - Check if the `style={{` props are in the compiled code

## Expected Result

After following ALL these steps, when you click "Deploy to Vercel":
- Modal opens
- Input field has dark text (you can see what you type)
- **Cancel button**: Visible with gray text on white background
- **Save Token button**: Visible with white text on purple gradient

The buttons MUST be visible because the inline styles are hardcoded in the source files.
