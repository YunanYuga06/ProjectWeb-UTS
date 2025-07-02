// ProjectWeb-UTS-main/Backend/src/controllers/destinationController.js

const { PrismaClient } = require('@prisma/client'); // Impor PrismaClient
const prisma = new PrismaClient(); // Inisialisasi Prisma Client

async function getAllDestinations(req, res) {
    try {
        const destinations = await prisma.destination.findMany(); // Ambil semua destinasi dari database
        res.status(200).json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Failed to fetch destinations.' });
    }
}

async function getDestinationById(req, res) {
    const destinationId = parseInt(req.params.id);

    if (isNaN(destinationId)) {
        return res.status(400).json({ message: 'Invalid destination ID.' });
    }

    try {
        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
        });

        if (destination) {
            res.status(200).json(destination);
        } else {
            res.status(404).json({ message: 'Destination not found.' });
        }
    } catch (error) {
        console.error('Error fetching destination by ID:', error);
        res.status(500).json({ message: 'Failed to fetch destination.' });
    }
}

module.exports = {
    getAllDestinations,
    getDestinationById
};