/**
 * Startup scripts templates for running both frontend and proxy server
 *
 * Provides scripts for Unix (start.sh) and Windows (start.bat) platforms
 */
/**
 * Generate start.sh script for Unix/Linux/macOS
 *
 * @returns Shell script content for starting both servers
 */
export function startShTemplate() {
    return `#!/bin/bash

echo "=== Admin Portal Startup ==="
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down servers..."
  if [ ! -z "$PROXY_PID" ]; then
    kill $PROXY_PID 2>/dev/null
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
  fi
  exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

echo "Starting proxy server..."
cd proxy-server
npm install
npm start &
PROXY_PID=$!

# Wait for proxy to start
sleep 3

echo ""
echo "Starting frontend..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== Both servers running ==="
echo "Frontend: http://localhost:5173"
echo "Proxy: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
`;
}
/**
 * Generate start.bat script for Windows
 *
 * @returns Batch script content for starting both servers
 */
export function startBatTemplate() {
    return `@echo off
echo === Admin Portal Startup ===
echo.

echo Starting proxy server...
cd proxy-server
call npm install
if errorlevel 1 (
  echo Failed to install proxy server dependencies
  pause
  exit /b 1
)

start /B npm start
echo Proxy server started in background

timeout /t 3 /nobreak >nul

echo.
echo Starting frontend...
cd ../frontend
call npm install
if errorlevel 1 (
  echo Failed to install frontend dependencies
  pause
  exit /b 1
)

start /B npm run dev
echo Frontend started in background

echo.
echo === Both servers running ===
echo Frontend: http://localhost:5173
echo Proxy: http://localhost:4000
echo.
echo Press any key to stop...
pause >nul

echo.
echo Stopping servers...
taskkill /F /IM node.exe /T >nul 2>&1
echo Servers stopped
`;
}
/**
 * Generate README section for startup instructions
 *
 * @returns Markdown content explaining how to use the startup scripts
 */
export function startupInstructionsTemplate() {
    return `## Starting the Application

This project includes startup scripts for both Unix and Windows platforms.

### Unix/Linux/macOS

Make the script executable and run it:

\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

The script will:
1. Install dependencies for both proxy and frontend
2. Start the proxy server on port 4000
3. Start the frontend on port 5173
4. Display URLs for both services

Press \`Ctrl+C\` to stop both servers.

### Windows

Run the batch script:

\`\`\`cmd
start.bat
\`\`\`

The script will:
1. Install dependencies for both proxy and frontend
2. Start both servers in background
3. Display URLs for both services

Press any key in the console window to stop both servers.

### Manual Startup

If you prefer to start servers manually:

**Terminal 1 - Proxy Server:**
\`\`\`bash
cd proxy-server
npm install
npm start
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Ports

- **Frontend**: http://localhost:5173
- **Proxy Server**: http://localhost:4000

Make sure these ports are available before starting the application.
`;
}
