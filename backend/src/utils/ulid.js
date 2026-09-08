import crypto from 'crypto';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;

/**
 * Generates a 26-character Crockford Base32 ULID
 */
export function generateUlid() {
  const now = Date.now();
  let timeStr = '';
  let time = now;

  // 10 chars for timestamp (48 bits)
  for (let i = 9; i >= 0; i--) {
    const mod = time % ENCODING_LEN;
    timeStr = ENCODING.charAt(mod) + timeStr;
    time = Math.floor(time / ENCODING_LEN);
  }

  // 16 chars for randomness (80 bits)
  const randomBytes = crypto.randomBytes(10);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const byte = randomBytes[i % randomBytes.length];
    randStr += ENCODING.charAt(byte % ENCODING_LEN);
  }

  return timeStr + randStr;
}

/**
 * Generates a customer-friendly unique slug (e.g., "dana-7f82k")
 */
export function generateSlug(name = 'invite') {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) || 'invite';

  const randomSuffix = crypto.randomBytes(3).toString('hex').slice(0, 5);
  return `${cleanName}-${randomSuffix}`;
}
