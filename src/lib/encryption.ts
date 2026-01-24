import crypto from 'crypto';

const SECRET_KEY = process.env.CREDENTIAL_SECRET || 'dev-secret-key-must-be-32-bytes!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Derives a key from the secret using scrypt with a random salt.
 * Returns both the derived key and the salt for storage.
 */
function deriveKey(salt: Buffer) {
    return crypto.scryptSync(SECRET_KEY, salt, 32);
}

export function encrypt(text: string) {
    const salt = crypto.randomBytes(16); // Random salt per encryption
    const key = deriveKey(salt);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        salt: salt.toString('hex'), // Store salt alongside encrypted data
        content: encrypted
    };
}

export function decrypt(encrypted: string, ivHex: string, saltHex: string) {
    const salt = Buffer.from(saltHex, 'hex');
    const key = deriveKey(salt);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

