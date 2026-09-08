import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Route Modules
import authRoutes from './modules/auth/auth.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. Postman, curl) or matched origins
    if (!origin || config.urls.corsOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
}));

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Uploads Folder
const uploadDirPath = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDirPath)) {
  fs.mkdirSync(uploadDirPath, { recursive: true });
}
app.use('/uploads', express.static(uploadDirPath));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;

