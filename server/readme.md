# BookMyMovie Backend

Node.js backend for the Movie Ticket Booking Website.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier)

## Setup Instructions

### 1. Navigate to server directory
```bash
cd server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure MongoDB Atlas

Open `server/.env` file and replace the MONGODB_URI with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bookmymovie?retryWrites=true&w=majority
```

To get your Atlas connection string:
1. Go to https://cloud.mongodb.com
2. Create a free account/login
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<username>` with your database username

### 4. Start the server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run at: http://localhost:5000

## Running the Full Stack Project

### Option 1: Run both servers manually

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd bookmymovie
npm run dev
```

### Option 2: Use the batch file (Windows)

Simply double-click `run-project.bat` - it will open two terminals and start both servers!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/favorites/:movieId` - Add to favorites
- `DELETE /api/auth/favorites/:movieId` - Remove from favorites

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by TMDB ID
- `GET /api/movies/search?q=` - Search movies
- `GET /api/movies/:id/shows` - Get shows for movie

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings/my-bookings` - Get user's bookings (requires auth)
- `GET /api/bookings/:id` - Get booking by ID (requires auth)
- `DELETE /api/bookings/:id` - Cancel booking (requires auth)

## Connecting Frontend

Update your React app to use the backend:

```javascript
// In your React app, update the API calls
const API_URL = 'http://localhost:5000/api';
```

## Project Structure

```
server/
├── config/
│   └── db.js           # Database configuration
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── models/
│   ├── User.js         # User model
│   ├── Movie.js       # Movie model
│   ├── Show.js        # Show/Schedule model
│   └── Booking.js     # Booking model
├── routes/
│   ├── auth.js        # Auth routes
│   ├── movies.js      # Movie routes
│   └── bookings.js    # Booking routes
├── .env.example       # Environment variables template
├── package.json
└── server.js          # Entry point
```

