// Enkripsi & dekripsi kredensial API Key milik user menggunakan AES-256-GCM (Node.js crypto).
// Format penyimpanan: v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const VERSION_PREFIX = 'v1';

function deriveKey(secret?: string): Buffer {
  const rawSecret = (secret || process.env.CREDENTIAL_ENCRYPTION_KEY || '').trim();
  if (!rawSecret) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY belum dikonfigurasi di server.');
  }
  return crypto.createHash('sha256').update(rawSecret, 'utf8').digest();
}

export function encryptApiKey(plainKey: string, secret?: string): string {
  const trimmed = typeof plainKey === 'string' ? plainKey.trim() : '';
  if (!trimmed) {
    throw new Error('API Key tidak boleh kosong.');
  }

  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(trimmed, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${VERSION_PREFIX}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptApiKey(encryptedPayload: string, secret?: string): string {
  if (typeof encryptedPayload !== 'string' || !encryptedPayload.startsWith(`${VERSION_PREFIX}:`)) {
    throw new Error('Format kredensial terenkripsi tidak valid.');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4) {
    throw new Error('Struktur kredensial terenkripsi rusak.');
  }

  const [, ivHex, authTagHex, cipherHex] = parts;
  const key = deriveKey(secret);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(cipherHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function maskApiKey(plainKey: string): string {
  const trimmed = typeof plainKey === 'string' ? plainKey.trim() : '';
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 6)}••••${trimmed.slice(-4)}`;
}
