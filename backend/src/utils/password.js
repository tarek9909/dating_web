import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcryptjs
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored bcrypt hash
 */
export async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generates a secure random temporary password (e.g. 12 characters with letters, numbers, symbols)
 */
export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}
