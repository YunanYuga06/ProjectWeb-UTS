// File: ProjectWeb-UTS-main/Backend/src/controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, verifyPassword, encrypt, decrypt } = require('../utils/cryptoUtils');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di .env. Mohon set kunci rahasia yang kuat!');
    process.env.JWT_SECRET = 'supersecretjwtkeyforlocaldev';
}

async function register(req, res) {
    const { username, nama, email, sandi } = req.body;

    if (!username || !nama || !email || !sandi) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username: username },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username sudah digunakan.' });
        }

        const hashedPassword = await hashPassword(sandi);
        const encryptedFullName = encrypt(nama);
        const encryptedEmail = encrypt(email);

        const newUser = await prisma.user.create({
            data: {
                username: username,
                hashedPassword: hashedPassword,
                encryptedFullName: encryptedFullName,
                encryptedEmail: encryptedEmail,
                role: 'user', // Default role saat registrasi
            },
        });

        res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
    }
}

async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const isPasswordValid = await verifyPassword(password, user.hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role }, // Pastikan userId, username, role ada di payload
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            userId: user.id,
            username: user.username,
            role: user.role, // Kirim role ke frontend juga
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
    }
}

async function getLoggedInUser(req, res) {
    try {
        // req.userId seharusnya sudah disetel oleh authMiddleware
        if (!req.userId) {
            console.error('getLoggedInUser: req.userId is missing after authMiddleware.');
            return res.status(401).json({ message: 'User tidak terotentikasi. Missing userId from token.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                username: true,
                encryptedFullName: true,
                encryptedEmail: true,
                role: true,
            },
        });

        if (!user) {
            console.error(`getLoggedInUser: User with ID ${req.userId} not found in database.`);
            return res.status(404).json({ message: 'Detail user tidak ditemukan.' });
        }

        let decryptedFullName = user.encryptedFullName;
        let decryptedEmail = user.encryptedEmail;

        // Coba dekripsi hanya jika string terlihat terenkripsi (mengandung ':')
        if (user.encryptedFullName && user.encryptedFullName.includes(':')) {
            try {
                decryptedFullName = decrypt(user.encryptedFullName);
            } catch (e) {
                console.warn(`getLoggedInUser: Failed to decrypt user fullName for user ${user.id}: ${e.message}`);
            }
        }
        if (user.encryptedEmail && user.encryptedEmail.includes(':')) {
            try {
                decryptedEmail = decrypt(user.encryptedEmail);
            } catch (e) {
                console.warn(`getLoggedInUser: Failed to decrypt user email for user ${user.id}: ${e.message}`);
            }
        }


        res.status(200).json({
            id: user.id,
            username: user.username,
            fullName: decryptedFullName,
            email: decryptedEmail,
            role: user.role,
        });

    } catch (error) {
        console.error('Error getting logged in user details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil detail user.' });
    }
}

module.exports = {
    register,
    login,
    getLoggedInUser,
};