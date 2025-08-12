#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Starting Ikimina Platform in Production Mode   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if .env file exists
if [ ! -f ./backend/.env ]; then
  echo -e "${YELLOW}Creating .env file from .env-example${NC}"
  cp ./backend/.env-example ./backend/.env
  echo -e "${GREEN}Created .env file${NC}"
else
  echo -e "${GREEN}Using existing .env file${NC}"
fi

# Check if MongoDB is running
echo -e "${BLUE}Checking if MongoDB is running...${NC}"
if nc -z localhost 27017 2>/dev/null; then
  echo -e "${GREEN}MongoDB is running${NC}"
else
  echo -e "${RED}MongoDB is not running. Please start MongoDB first.${NC}"
  echo -e "${YELLOW}You can start MongoDB with: mongod --dbpath /path/to/data/db${NC}"
  exit 1
fi

# Create admin user if needed
echo -e "${BLUE}Creating admin user if needed...${NC}"
cd backend
node createSuperAdmin.js
echo -e "${GREEN}Admin user setup complete${NC}"

# Create test user if needed
echo -e "${BLUE}Creating test user if needed...${NC}"
node createTestUser.js
echo -e "${GREEN}Test user setup complete${NC}"

# Start backend in production mode
echo -e "${BLUE}Starting backend in production mode...${NC}"
NODE_ENV=production PORT=5000 node index.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to start...${NC}"
sleep 5

# Build and start frontend in production mode
echo -e "${BLUE}Building and starting frontend...${NC}"
cd ../frontend/web-client-vite
npm run build
echo -e "${GREEN}Frontend built successfully${NC}"
npm run preview -- --port 4173 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Ikimina Platform is running in production mode${NC}"
echo -e "${YELLOW}Backend URL: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:4173${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Admin Login:${NC}"
echo -e "  Email: admin@ikimina.com"
echo -e "  Password: admin123"
echo -e "${YELLOW}Test User Login:${NC}"
echo -e "  Phone: +250722222222"
echo -e "  Password: password123"
echo -e "${BLUE}==================================================${NC}"
echo -e "${RED}Press Ctrl+C to stop the server${NC}"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${RED}Stopping servers...${NC}'; exit" INT
wait 