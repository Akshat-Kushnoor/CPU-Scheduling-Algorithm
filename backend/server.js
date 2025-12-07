import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import testCaseRoutes from './routes/testCaseRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CPU Scheduler Simulator API',
    version: '1.0.0',
    description: 'Backend API for CPU Scheduling Algorithm Simulation',
    endpoints: {
      algorithms: 'GET /api/algorithms',
      schedule: 'POST /api/schedule',
      compare: 'POST /api/schedule/compare',
      history: 'GET /api/schedule/history',
      testCases: {
        list: 'GET /api/testcases',
        get: 'GET /api/testcases/:id',
        upload: 'POST /api/testcases/upload',
        run: 'POST /api/testcases/run/:id',
        update: 'PUT /api/testcases/:id',
        delete: 'DELETE /api/testcases/:id'
      }
    },
    documentation: '/api/docs'
  });
});

// Mount routes
app.use('/api/schedule', scheduleRoutes);
app.use('/api', scheduleRoutes); // Also mount at /api for /api/algorithms and /api/compare
app.use('/api/testcases', testCaseRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║     CPU Scheduler Simulator API                      ║
╠══════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                   ║
║  📊 Environment:                                     ║
║          ${process.env.NODE_ENV ||'development'}     ║
║  🌐 API Base URL: http://localhost:${PORT}/api       ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default app;