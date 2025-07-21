#!/bin/bash

echo "Starting development environment..."

# Kill any existing Next.js processes
echo "Cleaning up existing processes..."
pkill -f "next dev" || true
sleep 1

# Start Next.js app in background to determine the port
echo "Starting Next.js app to determine port..."
npm run dev:app > /tmp/nextjs.log 2>&1 &
NEXT_PID=$!

# Wait for Next.js to start and extract the port
echo "Waiting for Next.js to start..."
sleep 5

# Extract the port from the Next.js logs
PORT=$(grep -o "Local:.*http://localhost:[0-9]*" /tmp/nextjs.log | grep -o "[0-9]*" | head -1)

if [ -z "$PORT" ]; then
    echo "Could not determine port, using default 3000"
    PORT=3000
else
    echo "Detected Next.js running on port $PORT"
fi

# Kill the background Next.js process
kill $NEXT_PID 2>/dev/null
wait $NEXT_PID 2>/dev/null

# Open a new terminal for Stripe webhook listener with the correct port
echo "Opening new terminal for Stripe webhook listener on port $PORT..."
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd \"$(pwd)\" && echo 'Starting Stripe webhook listener on port $PORT...' && stripe listen --forward-to localhost:$PORT/api/webhooks/stripe"
end tell
EOF

# Wait a moment for the new terminal to open
sleep 2

echo "Starting Next.js app in this terminal..."
echo "Development environment started!"
echo "Next.js app will run in this terminal on port $PORT"
echo "Stripe webhook listener is running in a new terminal window"
echo "Press Ctrl+C to stop the Next.js app"

# Start the Next.js app in the foreground (this will keep the script running)
npm run dev:app