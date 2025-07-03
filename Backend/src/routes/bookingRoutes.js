// File: ProjectWeb-UTS-main/Backend/src/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../Middleware/authMiddleware'); // Pastikan ini diimpor

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Folder tempat file akan disimpan. Pastikan folder ini ada!
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Nama file akan unik: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); // Inisialisasi multer dengan konfigurasi penyimpanan

// Rute untuk membuat booking baru (membutuhkan otentikasi dan upload file)
router.post('/', authMiddleware, upload.single('paymentProof'), bookingController.createBooking);

// Rute untuk mendapatkan semua booking (hanya admin/loket yang bisa melihat semua)
router.get('/', authMiddleware, bookingController.getAllBookings);

// Rute untuk mendapatkan booking berdasarkan ID booking
router.get('/:id', authMiddleware, bookingController.getBookingById);

// Rute untuk memperbarui booking (misalnya check-in)
router.put('/:id', authMiddleware, bookingController.updateBooking);

// Rute untuk mendapatkan booking berdasarkan User ID (untuk halaman profil user)
router.get('/user/:userId', authMiddleware, bookingController.getBookingsByUserId);

module.exports = router;