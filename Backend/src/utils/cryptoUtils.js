// backend/src/utils/cryptoUtils.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Ambil kunci hex dari .env
// PASTIKAN NAMA VARIABEL DI .env ADALAH AES_SECRET_KEY_HEX
const AES_SECRET_KEY_HEX_FROM_ENV = process.env.AES_SECRET_KEY;

// Variabel ini akan menyimpan kunci AES dalam bentuk Buffer (32 byte)
let AES_KEY_BUFFER;

// Logika untuk menentukan kunci AES
if (AES_SECRET_KEY_HEX_FROM_ENV) {
    try {
        AES_KEY_BUFFER = Buffer.from(AES_SECRET_KEY_HEX_FROM_ENV, 'hex');
        // Periksa apakah panjang Buffer tepat 32 byte (untuk AES-256)
        if (AES_KEY_BUFFER.length !== 32) {
            throw new Error(`Kunci AES dari .env tidak memiliki panjang 32 byte yang benar. Panjang aktual: ${AES_KEY_BUFFER.length} byte.`);
        }
    } catch (e) {
        console.error(`ERROR: Gagal memuat kunci AES dari .env atau kunci tidak valid: ${e.message}`);
        // Fallback: Generate kunci baru jika ada masalah dengan kunci di .env
        AES_KEY_BUFFER = crypto.randomBytes(32);
        console.warn('WARNING: Menggunakan kunci AES acak sementara karena kunci di .env bermasalah.');
        console.warn('Generated temporary AES_SECRET_KEY_HEX (salin ini ke .env Anda):', AES_KEY_BUFFER.toString('hex'));
    }
} else {
    // Jika AES_SECRET_KEY_HEX tidak ditemukan di .env, generate otomatis
    AES_KEY_BUFFER = crypto.randomBytes(32);
    console.warn('WARNING: AES_SECRET_KEY_HEX tidak ditemukan di .env. Menggunakan kunci AES acak sementara.');
    console.warn('Generated temporary AES_SECRET_KEY_HEX (salin ini ke .env Anda):', AES_KEY_BUFFER.toString('hex'));
}


const IV_LENGTH = 16; // Untuk AES-256-CBC, IV harus 16 bytes

// --- Password Hashing (bcrypt) ---
const saltRounds = 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// --- AES Encryption/Decryption ---
function encryptData(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    // Gunakan AES_KEY_BUFFER yang sudah kita siapkan
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedText) {
    if (!encryptedText) return null;
    try {
        const textParts = encryptedText.split(':');
        if (textParts.length !== 2) {
            console.error('Format teks terenkripsi tidak valid untuk dekripsi.');
            return null;
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = Buffer.from(textParts.join(':'), 'hex');
        // Gunakan AES_KEY_BUFFER yang sudah kita siapkan
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error('Dekripsi gagal:', e);
        return null;
    }
}

module.exports = {
    hashPassword,
    verifyPassword,
    encryptData,
    decryptData
};