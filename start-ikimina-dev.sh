#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Starting Ikimina Platform in Development Mode   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}MongoDB is not installed. Please install MongoDB first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "./backend/.env" ]; then
  echo -e "${YELLOW}Creating .env file from .env-example...${NC}"
  cp ./backend/.env-example ./backend/.env
  echo -e "${GREEN}Created .env file${NC}"
fi

# Start MongoDB if not already running
echo -e "${YELLOW}Starting MongoDB...${NC}"
mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongodb.log
echo -e "${GREEN}MongoDB started${NC}"
sleep 3

# Start backend
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm install
node index.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started at http://localhost:5000 (PID: $BACKEND_PID)${NC}"
cd ..
sleep 3

# Start frontend
echo -e "${YELLOW}Starting frontend development server...${NC}"
cd frontend/web-client-vite
npm install
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started (PID: $FRONTEND_PID)${NC}"
cd ../..

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Ikimina Platform is running in development mode${NC}"
echo -e "${YELLOW}Backend: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}Default users:${NC}"
echo -e "- Admin: admin@ikimina.com / admin123"
echo -e "- User: +250722222222 / password123"
echo -e "- Manager: +250733333333 / password123"
echo -e "${BLUE}==================================================${NC}"
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"

# Handle Ctrl+C to stop all processes
trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${RED}Stopping servers...${NC}'; mongod --shutdown; exit" INT
wait 