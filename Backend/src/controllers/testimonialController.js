// File: ProjectWeb-UTS-main/Backend/src/controllers/testimonialController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cryptoUtils = require('../utils/cryptoUtils'); // Pastikan ini diimpor


// Fungsi untuk menyamarkan nama (misal: "John Doe" -> "J***e")
// --- FUNGSI INI DIHAPUS / TIDAK DIGUNAKAN LAGI UNTUK DISPLAY NAME ANONIM ---
/*
function anonymizeName(name) {
    if (!name || typeof name !== 'string') {
        return 'Anonim';
    }
    if (name.length <= 2) {
        return name[0] + '***';
    }
    return name[0] + '***' + name[name.length - 1];
}
*/
// --- AKHIR FUNGSI LAMA ---

// Fungsi untuk membuat testimonial baru (kode yang sudah dimodifikasi sebelumnya)
async function createTestimonial(req, res) {
  const { quoteText, destinationId, userId, bookingId } = req.body;

  if (!req.userId || req.userId !== parseInt(userId)) {
    return res.status(403).json({ message: 'Akses ditolak. Anda tidak diizinkan membuat testimonial untuk user lain.' });
  }

  if (!quoteText || !userId) {
    return res.status(400).json({ message: 'Quote text dan User ID wajib diisi.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!userExists) { return res.status(404).json({ message: 'User tidak ditemukan.' }); }

    let destinationExists = null;
    if (destinationId) {
        destinationExists = await prisma.destination.findUnique({ where: { id: parseInt(destinationId) } });
        if (!destinationExists) { return res.status(404).json({ message: 'Destinasi tidak ditemukan.' }); }
    }

    if (bookingId) {
        const bookingExists = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
        if (!bookingExists) {
            return res.status(404).json({ message: 'Booking tidak ditemukan.' });
        }
        if (bookingExists.userId !== parseInt(userId)) {
            return res.status(403).json({ message: 'Anda hanya dapat memberikan testimonial untuk booking Anda sendiri.' });
        }
        const existingTestimonialForBooking = await prisma.testimonial.findUnique({
            where: { bookingId: parseInt(bookingId) }
        });
        if (existingTestimonialForBooking) {
            return res.status(409).json({ message: 'Anda sudah memberikan testimonial untuk booking ini.' });
        }
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        quoteText,
        destinationId: destinationId ? parseInt(destinationId) : null,
        userId: parseInt(userId),
        bookingId: bookingId ? parseInt(bookingId) : null,
      },
    });

    res.status(201).json({
      message: 'Testimonial berhasil dibuat!',
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat testimonial.', error: error.message });
  }
}

// Fungsi untuk mendapatkan semua testimonial (jika masih digunakan)
async function getAllTestimonials(req, res) {
    try {
        const testimonials = await prisma.testimonial.findMany({
            include: {
                user: {
                    select: { username: true, encryptedFullName: true }
                },
                destination: {
                    select: { name: true }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        const anonymizedTestimonials = testimonials.map(t => {
            // Dekripsi fullName terlebih dahulu
            const userFullName = t.user?.encryptedFullName ? cryptoUtils.decrypt(t.user.encryptedFullName) : null;
            const username = t.user?.username;

            return {
                ...t,
                user: {
                    // --- PERUBAHAN DI SINI ---
                    // Menggunakan hash dari username sebagai display name
                    displayName: cryptoUtils.hashString(username || userFullName || 'Anonim') // Fallback jika keduanya null
                    // --- AKHIR PERUBAHAN ---
                },
                userId: undefined, // Hapus userId dari respons jika tidak ingin mengekspos
                user: {
                    displayName: cryptoUtils.hashString(username || userFullName || 'Anonim')
                }
            };
        });

        res.status(200).json(anonymizedTestimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Gagal mengambil testimonial.', error: error.message });
    }
}

// Fungsi untuk mengambil testimonial berdasarkan Destinasi ID
async function getTestimonialsByDestinationId(req, res) {
    const { destinationId } = req.params;

    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                destinationId: parseInt(destinationId)
            },
            include: {
                user: {
                    select: { username: true, encryptedFullName: true }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        const anonymizedTestimonials = testimonials.map(t => {
            const userFullName = t.user?.encryptedFullName ? cryptoUtils.decrypt(t.user.encryptedFullName) : null;
            const username = t.user?.username;

            return {
                ...t,
                user: {
                    // --- PERUBAHAN DI SINI ---
                    // Menggunakan hash dari username sebagai display name
                    displayName: cryptoUtils.hashString(username || userFullName || 'Anonim') // Fallback jika keduanya null
                    // --- AKHIR PERUBAHAN ---
                },
                // Hapus data user asli yang tidak disamarkan
                userId: undefined,
                user: { displayName: cryptoUtils.hashString(username || userFullName || 'Anonim') }
            };
        });

        res.status(200).json(anonymizedTestimonials);
    } catch (error) {
        console.error('Error fetching testimonials by destination ID:', error);
        res.status(500).json({ message: 'Gagal mengambil testimonial untuk destinasi ini.', error: error.message });
    }
}

module.exports = {
    createTestimonial,
    getAllTestimonials,
    getTestimonialsByDestinationId,
};