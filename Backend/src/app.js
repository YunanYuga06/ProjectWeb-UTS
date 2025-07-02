// backend/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000; // Port untuk backend API

// Middleware
app.use(cors()); // Mengizinkan permintaan lintas asal dari frontend
app.use(express.json()); // Mengizinkan Express untuk membaca JSON dari body request
app.use(express.urlencoded({ extended: true })); // Untuk parsing URL-encoded bodies

// Serving static frontend files (misalnya, HTML, CSS, JS)
// Pastikan folder 'public' berisi semua file frontend Anda
app.use(express.static(path.join(__dirname, '..', 'public')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
// const bookingRoutes = require('./routes/bookingRoutes'); // Akan dibuat nanti

// Gunakan Routes
app.use('/api/auth', authRoutes); // Semua rute di authRoutes akan diawali dengan /api/auth
// app.use('/api/bookings', bookingRoutes);

// Rute untuk fallback ke index.html jika ada rute yang tidak ditemukan di backend API
// Ini penting jika Anda ingin single page application atau untuk menangani refresh halaman
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
    console.log(`Frontend served from http://localhost:${PORT}`);
});