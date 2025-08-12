# Ikimina Platform

A community savings and loan management platform for Rwanda.

## Overview

Ikimina is a digital platform that helps community savings groups (known as "Ikimina" in Rwanda) manage their operations, including member contributions, loans, meetings, and financial reporting.

## Project Structure

- `/backend` - Node.js/Express API server
  - `/app` - Application code
    - `/controllers` - API controllers
    - `/models` - MongoDB models
    - `/routes` - API routes
    - `/utils` - Utility functions
  - `/config` - Configuration files
  - `/middleware` - Express middleware

- `/frontend` - React/Vite frontend
  - `/web-client-vite` - Web client
    - `/src` - Source code
      - `/components` - React components
      - `/pages` - Page components
      - `/services` - API services
      - `/store` - State management

## System Requirements

- Node.js v14+
- MongoDB v4.4+
- npm or yarn

## Running the Application

### Production-Like Mode

To run the application in a production-like mode locally:

#### Using Scripts

**For Linux/Mac:**
```bash
# Make the scripts executable
chmod +x run-ikimina-prod.sh
chmod +x run-ikimina-prod-frontend.sh

# Run the backend
./run-ikimina-prod.sh

# In a new terminal, run the frontend
./run-ikimina-prod-frontend.sh
```

**For Windows:**
```
# Run the backend
run-ikimina-prod.bat

# In a new terminal, run the frontend
run-ikimina-prod-frontend.bat
```

#### Manual Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env-example .env  # Modify as needed
   NODE_ENV=production node index.js
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend/web-client-vite
   npm install
   npm run build
   npm run preview
   ```

3. **Access the application:**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:4173

### Development Mode

To run the application in development mode:

1. **Start MongoDB:**
   ```bash
   mongod --dbpath /path/to/data/db
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start frontend:**
   ```bash
   cd frontend/web-client-vite
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5173

## Default Users

The system creates the following default users for testing:

1. **Admin User:**
   - Email: admin@ikimina.com
   - Password: admin123
   - Access: Admin Dashboard at http://localhost:4173/admin/login

2. **Regular User:**
   - Phone: +250722222222
   - Password: password123
   - Access: Member Dashboard at http://localhost:4173/login

3. **Manager User:**
   - Phone: +250733333333
   - Password: password123
   - Access: Member Dashboard at http://localhost:4173/login

## Application Structure

### User-Facing Features

- **Homepage** (`/`): Landing page with information about the platform
- **Authentication**:
  - Login (`/login`)
  - Registration (`/register`)
- **Member Dashboard** (`/member/dashboard`):
  - Group management
  - Contributions
  - Loans
  - Meetings
  - Reports

### Admin Panel

The admin panel is completely separate from the user-facing application:

- **Admin Login** (`/admin/login`)
- **Admin Dashboard** (`/admin/dashboard`)
- Features:
  - User management
  - Group approval
  - System monitoring
  - Reports

## License

This project is proprietary and confidential.