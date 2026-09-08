import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'invitation_platform',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_secret_for_development_jwt_access',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenDays: parseInt(process.env.REFRESH_TOKEN_DAYS || '14', 10),
  },

  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    admin: process.env.ADMIN_URL || 'http://localhost:5173/admin',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
  },

  notifications: {
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@platform.com',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxImageMb: parseInt(process.env.MAX_IMAGE_UPLOAD_MB || '10', 10),
    maxGifMb: parseInt(process.env.MAX_GIF_UPLOAD_MB || '20', 10),
  }
};
