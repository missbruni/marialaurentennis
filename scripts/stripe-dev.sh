#!/bin/bash

echo "🧹 Cleaning up previous Stripe CLI sessions..."

# Kill any existing stripe listen processes
pkill -f 'stripe listen' 2>/dev/null || echo "No existing Stripe CLI processes found"

# Kill any processes using port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No processes using port 3001"

# Wait a moment for processes to fully terminate
sleep 1

echo "🚀 Starting new Stripe CLI session..."
stripe listen --forward-to localhost:3001/api/webhooks/stripe