import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirPath = path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(uploadDirPath)) {
  fs.mkdirSync(uploadDirPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadMediaMiddleware = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Unsupported file type. Only JPEG, PNG, WEBP, and GIF are allowed.');
      err.statusCode = 400;
      cb(err);
    }
  },
});
