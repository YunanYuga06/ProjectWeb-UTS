// ProjectWeb-UTS-main/Backend/src/app.js

const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json()); // Untuk parsing body JSON dari request
app.use(express.urlencoded({ extended: true })); // Untuk parsing URL-encoded body dari request

// Serve static files from the 'public' directory
// Penting agar file HTML, CSS, JS, dan gambar di folder public bisa diakses oleh browser
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes'); // Impor routes destinasi

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes); // Gunakan routes destinasi

// Catch-all routes to serve HTML files directly from public directory
// Ini memastikan halaman HTML Anda dapat diakses langsung melalui URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/our-services.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'our-services.html'));
});

app.get('/galery.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'galery.html'));
});

app.get('/about-us.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'about-us.html'));
});

app.get('/contact-us.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'contact-us.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

app.get('/profil.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'profil.html'));
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});