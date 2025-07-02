// ProjectWeb-UTS-main/Backend/src/routes/destinationRoutes.js

const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController'); // Impor controller destinasi

// Route untuk mendapatkan semua destinasi
router.get('/', destinationController.getAllDestinations);

// Route untuk mendapatkan destinasi berdasarkan ID (opsional, jika Anda membutuhkannya nanti)
router.get('/:id', destinationController.getDestinationById);

module.exports = router;