require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const { globalLimiter } = require('./middleware/rateLimiter');

const authRoutes        = require('./routes/auth');
const profileRoutes     = require('./routes/profile');
const foodRoutes        = require('./routes/foods');
const logRoutes         = require('./routes/logs');
const supplementRoutes  = require('./routes/supplements');
const workoutRoutes     = require('./routes/workouts');
const measurementRoutes = require('./routes/measurements');
const analyticsRoutes   = require('./routes/analytics');
const reviewRoutes      = require('./routes/review');

const app = express();

connectDB();

// Simple CORS — set headers on every request, handle preflight inline
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use('/api/auth',        authRoutes);
app.use('/api/profile',     profileRoutes);
app.use('/api/foods',       foodRoutes);
app.use('/api/logs',        logRoutes);
app.use('/api/supplements',   supplementRoutes);
app.use('/api/workouts',      workoutRoutes);
app.use('/api/measurements',  measurementRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/review',        reviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
