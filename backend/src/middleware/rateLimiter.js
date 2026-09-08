import rateLimit from 'express-rate-limit';

export const publicRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests submitted. Please try again in 15 minutes.',
    }
  }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    }
  }
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // 3 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts. Please try again later.',
    }
  }
});
