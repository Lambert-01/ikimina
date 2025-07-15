#!/bin/bash
echo "Starting Ikimina in development mode..."
echo

# Check for MongoDB
echo "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
  echo "Warning: mongosh command not found. Skipping MongoDB check."
else
  if ! mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    echo "Error: MongoDB does not appear to be running."
    echo "Please start MongoDB before running this script."
    echo
    exit 1
  fi
  echo "MongoDB is running."
fi

echo

# Start the backend server in a new terminal
echo "Starting backend server..."
cd backend
node run-dev.js &
BACKEND_PID=$!
cd ..

# Wait for the backend to initialize
echo "Waiting for backend to start..."
sleep 5

# Start the frontend in a new terminal
echo "Starting frontend..."
cd frontend/web-client-vite
npm run dev &
FRONTEND_PID=$!
cd ../..

echo
echo "Ikimina development environment is starting up!"
echo
echo "- Backend: http://localhost:5000"
echo "- Frontend: http://localhost:5173"
echo
echo "⚠️ This is a development setup with authentication bypass enabled."
echo "⚠️ DO NOT USE THIS IN PRODUCTION."
echo
echo "Press Ctrl+C to stop all processes."

# Function to handle SIGINT (Ctrl+C)
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for processes
wait 