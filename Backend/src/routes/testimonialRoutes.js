// File: ProjectWeb-UTS-main/Backend/src/routes/testimonialRoutes.js

const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const authMiddleware = require('../Middleware/authMiddleware'); // Pastikan ini diimpor

router.post('/', authMiddleware, testimonialController.createTestimonial); // <--- PASTIKAN BARIS INI ADA DAN BENAR

// Rute lainnya (jika ada)
router.get('/destination/:destinationId', testimonialController.getTestimonialsByDestinationId);

module.exports = router;