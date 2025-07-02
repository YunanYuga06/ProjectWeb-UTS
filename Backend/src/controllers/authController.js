// backend/src/controllers/authController.js
const prisma = require('../prisma');
const { hashPassword, verifyPassword, encryptData, decryptData } = require('../utils/cryptoUtils');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Pastikan JWT_SECRET diambil dari .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di .env. Mohon set kunci rahasia yang kuat!');
    // Untuk pengembangan, gunakan kunci dummy (JANGAN GUNAKAN DI PRODUKSI)
    process.env.JWT_SECRET = 'supersecretjwtkeyforlocaldev';
}


async function register(req, res) {
    const { nama, email, sandi } = req.body;

    if (!nama || !email || !sandi) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username: nama },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username sudah digunakan.' });
        }

        const hashedPassword = await hashPassword(sandi);
        const encryptedFullName = encryptData(nama);
        const encryptedEmail = encryptData(email);

        const newUser = await prisma.user.create({
            data: {
                username: nama,
                hashedPassword: hashedPassword,
                // salt: 'some_placeholder_salt', // Jika Anda tetap ingin kolom salt di DB dan sudah diubah jadi opsional
                encryptedFullName: encryptedFullName,
                encryptedEmail: encryptedEmail,
            },
        });

        res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
    }
}

async function login(req, res) {
    const { username, password } = req.body; // Sesuaikan dengan nama input HTML

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi.' });
    }

    try {
        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Verifikasi password
        const isPasswordValid = await verifyPassword(password, user.hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Jika password valid, buat JWT
        // Payload JWT: informasi yang ingin Anda simpan di token (misal: userId, username)
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' } // Token akan kadaluarsa dalam 1 jam
        );

        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            userId: user.id,
            username: user.username,
            // Anda bisa tambahkan data user lain yang tidak sensitif di sini jika perlu
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
    }
}

module.exports = {
    register,
    login // Export fungsi login juga
};