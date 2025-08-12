#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Starting Ikimina Backend Server   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}MongoDB is not installed. Please install MongoDB first.${NC}"
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d ~/data/db ]; then
  echo -e "${YELLOW}Creating MongoDB data directory...${NC}"
  mkdir -p ~/data/db
  echo -e "${GREEN}Created MongoDB data directory${NC}"
fi

# Create .env file if it doesn't exist
cd backend
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file from .env-example...${NC}"
  cp .env-example .env
  echo -e "${GREEN}Created .env file${NC}"
fi

# Update NODE_ENV to development
echo -e "${YELLOW}Setting NODE_ENV to development...${NC}"
sed -i 's/NODE_ENV=production/NODE_ENV=development/g' .env

# Start MongoDB
echo -e "${YELLOW}Starting MongoDB...${NC}"
mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongodb.log
echo -e "${GREEN}MongoDB started${NC}"
sleep 3

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}Dependencies installed${NC}"
fi

# Create test users
echo -e "${YELLOW}Creating test users...${NC}"
node createSuperAdmin.js
node createTestUser.js
echo -e "${GREEN}Test users created${NC}"

# Start the backend server
echo -e "${YELLOW}Starting backend server...${NC}"
node index.js

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Backend server is running at http://localhost:5000${NC}"
echo -e "${BLUE}==================================================${NC}"