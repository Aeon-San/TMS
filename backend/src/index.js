import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const envPath = new URL('../../.env', import.meta.url);
dotenv.config({ path: fileURLToPath(envPath) });
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import fs from "fs";
import conncetDB from './database/connction.js';
import authRoutes from './routes/auth.routes.js';
import taskRouter from './routes/task.routes.js';
import boardRoutes from './routes/board.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { cleanupTempFolder } from './library/cloudinary.js';
import { API_BODY_LIMIT, CORS_ORIGINS } from './config/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestSanitizer } from './middleware/requestSanitizer.js';
import { logger } from './library/logger.js';

const app = express();
const PORT = process.env.PORT || 9000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const frontendDist = path.join(repoRoot, 'frontend', 'dist');
const hasFrontendDist = fs.existsSync(frontendDist);
const allowedOrigins = new Set([
  ...CORS_ORIGINS,
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

app.disable('x-powered-by');
app.use(express.json({ limit: API_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: API_BODY_LIMIT }));
app.use(cookieParser());
const apiCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(requestSanitizer);
app.use((req, res, next) => {
  logger.info('Incoming request', { method: req.method, path: req.originalUrl });
  next();
});

app.use('/api', apiCors);
app.use('/api/auth', authRoutes);
app.use('/api/task', taskRouter);
app.use('/api/board', boardRoutes);
app.use('/api/notifications', notificationRoutes);

if (hasFrontendDist) {
  app.use(express.static(frontendDist));
}

app.get("*", (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }

  return res.status(503).json({
    message: 'Frontend build not found. Run frontend dev server or build frontend/dist.',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is online at: http://localhost:${PORT}`);
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Temp directory created:', tempDir);
  }
  conncetDB();
  cleanupTempFolder();
});
