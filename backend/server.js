import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tenantRoutes from './src/routes/tenantRoutes.js';
import insightsRoutes from './src/routes/insightsRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import { startScheduler } from './src/services/schedulerService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter(Boolean).filter(url => !url.includes('your-') && !url.includes('placeholder')); // Filter out placeholder URLs

// Allow Vercel preview deployments (if FRONTEND_URL contains vercel.app)
const isVercelDomain = (origin) => {
  if (!origin) return false;
  return origin.includes('.vercel.app') || origin.includes('vercel.app');
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, health checks, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    if (allowedOrigins.includes(origin) || isVercelDomain(origin)) {
      callback(null, true);
    } else if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      // Emergency override for testing
      callback(null, true);
    } else {
      // Log but allow for now (you can make this stricter later)
      console.warn(`CORS: Unrecognized origin: ${origin}`);
      callback(null, true); // Temporarily allow all for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
}));

// Health check (before CORS, so it's always accessible)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Start scheduler if enabled (optional, can be disabled via env)
  if (process.env.ENABLE_SCHEDULER !== 'false') {
    try {
      const cronExpression = process.env.SYNC_CRON_EXPRESSION || '0 * * * *'; // Every hour
      startScheduler(cronExpression);
      console.log(`⏰ Scheduler started with expression: ${cronExpression}`);
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error.message);
      // Don't crash the server if scheduler fails
    }
  }
});

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  // Don't exit, let the server keep running
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Exit gracefully
  process.exit(1);
});

