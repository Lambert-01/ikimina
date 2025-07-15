# Ikimina

A digital platform for managing traditional Rwandan savings groups (Ikimina) with modern financial tools.

## Overview

Ikimina is a web application that digitizes the traditional Rwandan savings circle concept, allowing members to create, join, and manage savings groups. The platform facilitates contributions, loans, meetings, and financial reporting in a secure and transparent environment.

## Features

- **User Management**: Member and manager roles with appropriate permissions
- **Group Management**: Create, join, and manage savings groups
- **Contributions**: Schedule and track regular financial contributions
- **Loans**: Request, approve, and manage loans within groups
- **Meetings**: Schedule and conduct virtual or in-person meetings
- **Reports**: Generate financial reports and analytics
- **Notifications**: Receive alerts for important events and deadlines

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- React Router

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lambert-01/ikimina.git
cd ikimina
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend/web-client-vite
npm install
```

4. Set up environment variables:
   - Copy `.env-example` to `.env` in the backend directory
   - Update with your MongoDB connection string and other settings

### Running the Application

#### Development Mode
Run the start script:
```bash
# Windows
run-ikimina-dev.bat

# Linux/Mac
./run-ikimina-dev.sh
```

This will start both the backend server and frontend development server.

#### Manually
1. Start MongoDB (if running locally)
2. Start the backend:
```bash
cd backend
npm run dev
```

3. Start the frontend:
```bash
cd frontend/web-client-vite
npm run dev
```

## Project Structure

```
ikimina/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── config/
│   ├── middleware/
│   └── index.js
└── frontend/
    └── web-client-vite/
        ├── public/
        └── src/
            ├── components/
            ├── pages/
            ├── services/
            └── store/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 