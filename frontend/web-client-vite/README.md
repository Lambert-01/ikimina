# Ikimina Frontend

This is the frontend application for the Ikimina platform, built with React, TypeScript, Vite, and TailwindCSS.

## Project Structure

- `src/components` - Reusable UI components
- `src/pages` - Page components
- `src/services` - API services
- `src/store` - State management with Zustand
- `src/assets` - Static assets

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Ikimina
   VITE_APP_ENV=development
   VITE_AUTH_COOKIE_NAME=ikimina_auth_token
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build:
   ```bash
   npm run preview
   ```

## Running in Production-Like Mode

To run the application in a production-like mode locally:

1. Create a `.env.production-like` file with the following content:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Ikimina
   VITE_APP_ENV=production-like
   VITE_AUTH_COOKIE_NAME=ikimina_auth_token
   VITE_BYPASS_AUTH=false
   ```

2. Build the application in production-like mode:
   ```bash
   npm run production-like
   ```

3. Start the preview server:
   ```bash
   npm run preview
   ```

4. Access the application at http://localhost:4173

## Features

- **Homepage**: User-facing landing page with information about the platform
- **User Authentication**: Registration and login functionality
- **Member Dashboard**: Access to groups, contributions, loans, meetings, etc.
- **Admin Panel**: Completely separate admin interface for system management

## Admin Access

The admin panel is completely separate from the user-facing application and can be accessed at:

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (requires authentication)

## User Access

The user-facing application can be accessed at:

- `/` - Homepage
- `/login` - User login page
- `/register` - User registration page
- `/member/dashboard` - Member dashboard (requires authentication)
- `/manager/dashboard` - Manager dashboard (requires authentication with manager role)
