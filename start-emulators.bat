@echo off
echo Starting Firebase Emulators for Freezy Platform...
echo.
echo This will start:
echo - Auth Emulator on http://127.0.0.1:9099
echo - Firestore Emulator on http://127.0.0.1:8080
echo - Storage Emulator on http://127.0.0.1:9199
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

echo Starting emulators...
echo.
echo Open another terminal and run: npm run dev
echo Then visit: http://localhost:3000
echo.
firebase emulators:start --only auth,firestore,storage
