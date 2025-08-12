#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Starting Ikimina Frontend in Production Mode   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Navigate to frontend directory
cd frontend/web-client-vite

# Create .env.production-like file if it doesn't exist
if [ ! -f ".env.production-like" ]; then
  echo -e "${YELLOW}Creating .env.production-like file...${NC}"
  cat > .env.production-like << EOL
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Ikimina
VITE_APP_ENV=production-like
VITE_AUTH_COOKIE_NAME=ikimina_auth_token
VITE_BYPASS_AUTH=false
EOL
  echo -e "${GREEN}Created .env.production-like file${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}Dependencies installed${NC}"
fi

# Build the application in production-like mode
echo -e "${YELLOW}Building the application in production-like mode...${NC}"
npm run build --mode production-like
echo -e "${GREEN}Build complete${NC}"

# Start the preview server
echo -e "${YELLOW}Starting the preview server...${NC}"
npm run preview

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Ikimina Frontend is running in production mode${NC}"
echo -e "${YELLOW}Access the application at http://localhost:4173${NC}"
echo -e "${BLUE}==================================================${NC}" 