// File: ProjectWeb-UTS-main/Backend/src/utils/cryptoUtils.js

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ENCRYPTION_KEY_FROM_ENV = process.env.ENCRYPTION_KEY;

let AES_KEY_BUFFER;

if (ENCRYPTION_KEY_FROM_ENV) {
    try {
        AES_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY_FROM_ENV, 'hex');
        if (AES_KEY_BUFFER.length !== 32) {
            throw new Error(`Kunci AES dari .env tidak memiliki panjang 32 byte yang benar. Panjang aktual: ${AES_KEY_BUFFER.length} byte.`);
        }
    } catch (e) {
        console.error(`ERROR: Gagal memuat kunci AES dari .env atau kunci tidak valid: ${e.message}`);
        AES_KEY_BUFFER = crypto.randomBytes(32);
        console.warn('WARNING: Menggunakan kunci AES acak sementara karena kunci di .env bermasalah.');
        console.warn('Generated temporary ENCRYPTION_KEY (salin ini ke .env Anda):', AES_KEY_BUFFER.toString('hex'));
    }
} else {
    AES_KEY_BUFFER = crypto.randomBytes(32);
    console.warn('WARNING: ENCRYPTION_KEY tidak ditemukan di .env. Menggunakan kunci AES acak sementara.');
    console.warn('Generated temporary ENCRYPTION_KEY (salin ini ke .env Anda):', AES_KEY_BUFFER.toString('hex'));
}

const IV_LENGTH = 16;

const saltRounds = 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

function encrypt(text) {
    if (text === null || text === undefined) return null;
    text = String(text);

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
    if (encryptedText === null || encryptedText === undefined) return null;
    try {
        const textParts = encryptedText.split(':');
        if (textParts.length !== 2) {
            console.warn('Peringatan: Format teks terenkripsi tidak valid, mungkin data belum dienkripsi.');
            return encryptedText;
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('ERROR: Dekripsi gagal:', e.message);
        return encryptedText;
    }
}

// --- FUNGSI BARU: Hashing String (SHA-256) ---
function hashString(text) {
    if (text === null || text === undefined) {
        return null;
    }
    return crypto.createHash('sha256').update(String(text)).digest('hex');
}
// --- AKHIR FUNGSI BARU ---


module.exports = {
    hashPassword,
    verifyPassword,
    encrypt,
    decrypt,
    hashString, // <--- Ekspor fungsi baru
};