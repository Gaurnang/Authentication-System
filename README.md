# Authentication System

A full-stack MERN (MongoDB, Express, React, Node.js) authentication system with email verification and password reset functionality.

## Features

- ✅ User Registration with Email Verification
- ✅ User Login/Logout with JWT Authentication
- ✅ Password Reset via Email OTP
- ✅ Protected Routes
- ✅ User Profile Management
- ✅ Cookie-based Authentication
- ✅ Modern UI with TailwindCSS

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt.js for password hashing
- Nodemailer for email sending
- Cookie-parser for session management

### Frontend
- React 19 with Vite
- Redux Toolkit for state management
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- React Hot Toast for notifications

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Email service (Mailtrap for testing or SMTP credentials)

## Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd AuthenticationSystem
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

Update the `.env` file with your credentials:
- MongoDB Atlas connection string
- JWT secret key
- SMTP credentials
- Frontend URL

### 3. Frontend Setup
```bash
cd frontend/vite-project
npm install
```

## Running the Application

### Development Mode

**Start Backend** (from backend directory):
```bash
npm run dev
```
Backend will run on http://localhost:5000

**Start Frontend** (from frontend/vite-project directory):
```bash
npm run dev
```
Frontend will run on http://localhost:5174

### Production Build

**Build Frontend**:
```bash
cd frontend/vite-project
npm run build
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/users` - Get all users (protected)

## Deployment

### Recommended Free Services

**Option 1: Split Architecture**
- Frontend: Vercel/Netlify
- Backend: Render
- Database: MongoDB Atlas (Free tier)

**Option 2: All-in-One**
- Full Stack: Render
- Database: MongoDB Atlas

### Environment Variables for Production
Make sure to set these in your hosting service:
- `MONGODB_URI`
- `JWT_SECRET` (Generate a strong secret)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `FRONTEND_URL` (Your deployed frontend URL)
- `NODE_ENV=production`

## Project Structure

```
AuthenticationSystem/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/vite-project/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # Auth context
    │   ├── lib/             # Utilities
    │   ├── pages/           # Page components
    │   ├── App.jsx
    │   └── main.jsx         # Entry point
    ├── vite.config.js
    └── package.json
```

## Security Notes

- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Update CORS settings for production domains
- Use production-grade SMTP service (not Mailtrap)

## License

MIT

## Author

Your Name
