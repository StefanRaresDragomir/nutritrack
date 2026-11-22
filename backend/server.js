// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');

const { router: authRouter } = require('./routes/auth');
const usersRouter = require('./routes/users');
const foodsRouter = require('./routes/foods');
const goalsRouter = require('./routes/goals');
const dailyLogsRouter = require('./routes/dailyLogs');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. HTTP Security Headers (OWASP MASVS / MSTG recommendation)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to load in Expo apps
}));

// 2. CORS configuration allowing local network mobile requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Body parser with strict payload size limit (denial-of-service mitigation)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Rate limiting: General API protection (150 requests per minute)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: { error: 'Too many requests from this IP. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

// 5. Rate limiting: Stricter limit on auth routes to prevent brute-force & credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// 6. Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/daily-logs', dailyLogsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/uploads', uploadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 7. Global Error Handler (OWASP error handling: no stack traces or DB details leaked)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.message);
  return res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal error occurred.',
  });
});

// Helper to determine LAN IP for mobile Expo Go connection
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalNetworkIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🛡️  NutriTrack Local Secure Backend Running!`);
  console.log(`📡 Localhost:     http://localhost:${PORT}/api`);
  console.log(`📱 Expo / LAN IP: http://${localIp}:${PORT}/api`);
  console.log(`🔒 Cybersecurity controls active:`);
  console.log(`   - bcrypt password hashing (12 rounds)`);
  console.log(`   - JWT session management (24h expiry)`);
  console.log(`   - Helmet security headers & parameterized SQL`);
  console.log(`   - Brute-force rate limiting`);
  console.log(`====================================================`);
});
