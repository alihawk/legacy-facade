# Proxy Download Feature - Testing Guide

## ✅ Implementation Complete

All tasks (1-7) have been successfully implemented:

- ✅ Task 1: Created all proxy server templates
- ✅ Task 2: Created config generator
- ✅ Task 3: Created startup scripts (start.sh, start.bat)
- ✅ Task 4: Updated README with proxy documentation
- ✅ Task 5: Updated API service to call proxy
- ✅ Task 6: Updated ProjectGenerator with two-server architecture
- ✅ Task 7: Updated PortalPage to fetch proxy config

## 🧪 Testing Instructions

### Step 1: Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Step 2: Configure Proxy (Optional)

Test with JSONPlaceholder API:

```bash
curl -X POST http://localhost:8000/api/proxy/config \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://jsonplaceholder.typicode.com",
    "apiType": "rest",
    "auth": {"mode": "none"},
    "resources": [{
      "name": "users",
      "endpoint": "/users",
      "operations": {
        "list": {"rest": {"method": "GET", "path": "/users"}},
        "detail": {"rest": {"method": "GET", "path": "/users/{id}"}}
      },
      "fieldMappings": []
    }]
  }'
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

### Step 4: Generate Portal

1. Go to the analyzer page
2. Paste JSONPlaceholder API URL: `https://jsonplaceholder.typicode.com/users`
3. Click "Analyze API"
4. Click "Generate Portal"

### Step 5: Download Project

1. In the portal, click "Download Project" button
2. If proxy configured: Should show success with config
3. If not configured: Should show warning dialog, click OK to continue
4. ZIP file downloads: `admin-portal-[timestamp].zip`

### Step 6: Extract and Verify Structure

```bash
unzip admin-portal-*.zip -d test-portal
cd test-portal
ls -la
```

**Expected structure:**
```
test-portal/
├── README.md
├── start.sh
├── start.bat
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── services/api.ts
│   │   └── ...
│   └── ...
└── proxy-server/
    ├── package.json
    ├── tsconfig.json
    ├── config.json
    └── src/
        ├── index.ts
        ├── proxy.ts
        ├── fieldMapper.ts
        ├── authBuilder.ts
        ├── soapBuilder.ts
        └── config.ts
```

### Step 7: Verify config.json

```bash
cat proxy-server/config.json
```

**Should contain:**
- `baseUrl`: Your API URL or placeholder
- `apiType`: "rest" or "soap"
- `auth`: Auth configuration (with placeholders if not configured)
- `resources`: Array of resource configs

### Step 8: Run the Downloaded Project

**Unix/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

### Step 9: Verify Both Servers Start

**Expected output:**
```
Starting proxy server...
✓ Configuration loaded successfully
  API Type: rest
  Base URL: https://jsonplaceholder.typicode.com
  Resources: 1

🚀 Proxy server running on http://localhost:4000
   Health check: http://localhost:4000/health
   Proxy endpoint: http://localhost:4000/proxy

Starting frontend...
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 10: Test the UI

1. Open http://localhost:5173
2. Should see Dashboard with resources
3. Click on a resource (e.g., "Users")
4. Should see data loaded from the API via proxy
5. Check browser console - no CORS errors
6. Check proxy server logs - should see requests

### Step 11: Test Proxy Health Check

```bash
curl http://localhost:4000/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2024-..."}
```

### Step 12: Test Proxy Endpoint

```bash
curl http://localhost:4000/proxy/users
```

**Expected:**
- Should return user data from JSONPlaceholder
- Fields should be normalized if mappings configured

## 🐛 Troubleshooting

### Proxy server won't start
- Check if port 4000 is already in use: `lsof -i :4000`
- Verify config.json is valid JSON
- Check Node.js version: `node --version` (should be 18+)

### Frontend can't connect to proxy
- Ensure proxy server is running on port 4000
- Check browser console for errors
- Verify `frontend/src/services/api.ts` has correct proxy URL

### "Proxy not configured" warning
- This is expected if you didn't configure proxy in Step 2
- The download will still work with default config
- You'll need to manually update `proxy-server/config.json`

### CORS errors
- Proxy server should handle CORS automatically
- Check proxy server logs for errors
- Verify proxy server is actually running

### Field names don't match
- Update `fieldMappings` in `proxy-server/config.json`
- Restart proxy server after config changes

## ✨ Success Criteria

- ✅ ZIP downloads successfully
- ✅ Contains both frontend/ and proxy-server/ directories
- ✅ config.json has correct structure
- ✅ Startup scripts work on your platform
- ✅ Both servers start without errors
- ✅ Frontend loads at http://localhost:5173
- ✅ Proxy responds at http://localhost:4000
- ✅ Data displays correctly in the UI
- ✅ No CORS errors in browser console
- ✅ Proxy logs show successful requests

## 📝 Notes

- The generated project is completely standalone
- No dependency on the original backend
- Can be deployed to any hosting service
- Proxy server can be deployed separately from frontend
- Config can be updated without regenerating project

## 🎉 What You've Built

A complete two-server architecture that:
- **Solves CORS issues** - Proxy handles cross-origin requests
- **Handles authentication** - Secrets stay on server side
- **Maps field names** - Legacy → Normalized transformation
- **Supports SOAP** - XML ↔ JSON translation
- **Works standalone** - No backend dependency
- **Production ready** - Can be deployed anywhere

Congratulations! 🚀
