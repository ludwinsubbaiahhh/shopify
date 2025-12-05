import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tenantRoutes from './src/routes/tenantRoutes.js';
import insightsRoutes from './src/routes/insightsRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { startScheduler } from './src/services/schedulerService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/insights', insightsRoutes);

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
    const cronExpression = process.env.SYNC_CRON_EXPRESSION || '0 * * * *'; // Every hour
    startScheduler(cronExpression);
  }
});

