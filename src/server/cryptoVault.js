import crypto from 'node:crypto';

// Enkripsi Kredensial AI (BYOK) menggunakan AES-256-GCM.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit recommended for GCM
const AUTH_TAG_LENGTH = 16;

function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret || 'default-secret-salt-2026')).digest();
}

export function encryptApiKey(plainKey, secret) {
  if (!plainKey || typeof plainKey !== 'string') {
    throw new Error('API Key tidak boleh kosong.');
  }
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainKey, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptApiKey(encryptedPayload, secret) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') {
    throw new Error('Payload kredensial terenkripsi tidak valid.');
  }
  const parts = encryptedPayload.split('.');
  if (parts.length !== 3) {
    throw new Error('Format cipher tidak dikenali (memerlukan iv.tag.ciphertext).');
  }
  const [ivB64, tagB64, dataB64] = parts;
  const key = deriveKey(secret);
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const ciphertext = Buffer.from(dataB64, 'base64url');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export function maskApiKey(plainKey) {
  if (!plainKey || typeof plainKey !== 'string') return '';
  const trimmed = plainKey.trim();
  if (trimmed.length <= 8) return '••••••••';
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••${suffix}`;
}
