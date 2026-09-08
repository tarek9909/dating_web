import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Signs a short-lived JWT access token (15m)
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

/**
 * Verifies a JWT access token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

/**
 * Generates a cryptographically random refresh token string
 */
export function generateRandomToken(bytes = 40) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Produces SHA-256 hash of a token for safe database storage
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
