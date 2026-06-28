require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
