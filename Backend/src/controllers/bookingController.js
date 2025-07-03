// File: ProjectWeb-UTS-main/Backend/src/controllers/bookingController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cryptoUtils = require('../utils/cryptoUtils');

// Fungsi untuk membuat booking baru
async function createBooking(req, res) {
  const { userId, destinationId, bookingDate, paymentMethod, customerTransactionNumber, serviceId } = req.body;
  const paymentProofUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId || !destinationId || !bookingDate || !paymentMethod) {
    return res.status(400).json({ message: 'Semua field wajib diisi (userId, destinationId, bookingDate, paymentMethod).' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!userExists) { return res.status(404).json({ message: 'User tidak ditemukan.' }); }
    const destinationExists = await prisma.destination.findUnique({ where: { id: parseInt(destinationId) } });
    if (!destinationExists) { return res.status(404).json({ message: 'Destinasi tidak ditemukan.' }); }
    if (serviceId) {
      const serviceExists = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
      if (!serviceExists) { return res.status(404).json({ message: 'Service tidak ditemukan.' }); }
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        destinationId: parseInt(destinationId),
        bookingDate,
        paymentMethod,
        customerTransactionNumber: customerTransactionNumber || null,
        paymentProofUrl: paymentProofUrl,
        status: 'pending',
        serviceId: serviceId ? parseInt(serviceId) : null,
      },
    });

    res.status(201).json({ message: 'Booking berhasil dibuat!', booking: newBooking });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat booking.', error: error.message });
  }
}

// Fungsi untuk memperbarui booking (misalnya check-in)
async function updateBooking(req, res) {
  const { id } = req.params;
  const { status, ...otherUpdates } = req.body;

  if (!req.userRole || (req.userRole !== 'admin' && req.userRole !== 'loket')) {
    return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk memperbarui booking.' });
  }

  try {
    const existingBooking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBooking) { return res.status(404).json({ message: 'Booking tidak ditemukan.' }); }

    let updatedData = { ...otherUpdates, status: status };

    // Logika Enkripsi saat status berubah menjadi "checked-in"
    if (status === 'checked-in' && existingBooking.status !== 'checked-in') {
      console.log(`Update Booking ID: ${id}`);
      console.log(`Request status: ${status}`);
      console.log(`Existing booking status: ${existingBooking.status}`);
      console.log(`Condition for encryption: ${status === 'checked-in' && existingBooking.status !== 'checked-in'}`);
      console.log('--- ENCRYPTION LOGIC TRIGGERED ---');

      let encryptedTransactionNumber = existingBooking.customerTransactionNumber;
      let encryptedPaymentProofUrl = existingBooking.paymentProofUrl;

      if (existingBooking.customerTransactionNumber && !existingBooking.customerTransactionNumber.includes(':')) {
        encryptedTransactionNumber = cryptoUtils.encrypt(existingBooking.customerTransactionNumber);
      }
      if (existingBooking.paymentProofUrl && !existingBooking.paymentProofUrl.includes(':')) {
        encryptedPaymentProofUrl = cryptoUtils.encrypt(existingBooking.paymentProofUrl);
      }

      updatedData.customerTransactionNumber = encryptedTransactionNumber;
      updatedData.paymentProofUrl = encryptedPaymentProofUrl;

      console.log(`Booking ${id} Checked-in. Encrypted customer transaction number and payment proof URL.`);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    // --- PERUBAHAN DI SINI ---
    // Respon dikirim dengan data apa adanya dari database (sudah terenkripsi jika check-in)
    // Tidak ada dekripsi di sini agar admin dashboard melihat yang terenkripsi
    res.status(200).json({ message: 'Booking berhasil diperbarui!', booking: updatedBooking });
    // --- AKHIR PERUBAHAN ---

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Gagal memperbarui booking.', error: error.message });
  }
}

// Fungsi untuk mendapatkan semua booking (untuk admin/loket)
async function getAllBookings(req, res) {
    console.log('getAllBookings: START');
    console.log('getAllBookings: req.userRole received:', req.userRole);
    console.log('getAllBookings: Type of req.userRole:', typeof req.userRole);
    console.log('getAllBookings: Value of req.userRole (stringified):', JSON.stringify(req.userRole));

    if (!req.userRole || (req.userRole !== 'admin' && req.userRole !== 'loket')) {
        console.log('getAllBookings: Authorization FAILED. Condition was TRUE.');
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat semua booking.' });
    }
    console.log('getAllBookings: Authorization PASSED. req.userRole is:', req.userRole);

    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: {
                    select: { id: true, username: true, encryptedFullName: true, encryptedEmail: true }
                },
                destination: {
                    select: { id: true, name: true, basePrice: true, location: true, currency: true }
                },
                service: {
                    select: { id: true, name: true, price: true }
                },
            },
            orderBy: {
                bookingDate: 'desc'
            }
        });

        // --- PERUBAHAN DI SINI ---
        // Data dikirim apa adanya dari database. Dekripsi hanya untuk user di halaman profil.
        const bookingsForAdmin = bookings.map(booking => {
            let userDisplay = null;
            if (booking.user) {
                // Di sini kita tetap bisa mendekripsi user info jika dibutuhkan untuk admin dashboard
                // tanpa mempengaruhi encryption status dari nomor transaksi/bukti bayar
                let decryptedFullName = booking.user.encryptedFullName;
                let decryptedEmail = booking.user.encryptedEmail;

                if (booking.user.encryptedFullName && booking.user.encryptedFullName.includes(':')) {
                    try { decryptedFullName = cryptoUtils.decrypt(booking.user.encryptedFullName); } catch (e) { /* handle error */ }
                }
                if (booking.user.encryptedEmail && booking.user.encryptedEmail.includes(':')) {
                    try { decryptedEmail = cryptoUtils.decrypt(booking.user.encryptedEmail); } catch (e) { /* handle error */ }
                }
                userDisplay = { ...booking.user, fullName: decryptedFullName, email: decryptedEmail };
                delete userDisplay.encryptedFullName;
                delete userDisplay.encryptedEmail;
            }

            return {
                ...booking,
                user: userDisplay,
                // customerTransactionNumber dan paymentProofUrl TIDAK didekripsi di sini
                // sehingga admin dashboard akan menampilkan yang terenkripsi
            };
        });

        res.status(200).json(bookingsForAdmin);
        // --- AKHIR PERUBAHAN ---

    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar booking.', error: error.message });
    }
}

// Fungsi untuk mendapatkan booking berdasarkan ID
async function getBookingById(req, res) {
    const { id } = req.params;
    // Otorisasi awal: User biasa tidak boleh mencoba melihat booking orang lain melalui rute ini
    if (req.userRole === 'user' && req.userId !== parseInt(id)) { // Diasumsikan ID di URL adalah booking ID
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak diizinkan melihat booking ini.' });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { id: true, username: true, encryptedFullName: true, encryptedEmail: true, role: true } },
                destination: { select: { id: true, name: true, basePrice: true, location: true, currency: true } },
                service: { select: { id: true, name: true, price: true } },
            },
        });

        if (!booking) { return res.status(404).json({ message: 'Booking tidak ditemukan.' }); }

        // Otorisasi kedua: Pastikan user biasa hanya melihat bookingnya sendiri
        if (req.userRole === 'user' && booking.userId !== req.userId) {
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak diizinkan melihat booking ini.' });
        }

        // --- PERUBAHAN DI SINI: Dekripsi untuk tampilan detail (misal di halaman profil user) ---
        let decryptedBooking = { ...booking };
        if (decryptedBooking.status === 'checked-in' && decryptedBooking.customerTransactionNumber && decryptedBooking.customerTransactionNumber.includes(':')) {
            try {
                decryptedBooking.customerTransactionNumber = cryptoUtils.decrypt(decryptedBooking.customerTransactionNumber);
            } catch (e) {
                console.warn(`Failed to decrypt customerTransactionNumber for booking ${booking.id} in getBookingById: ${e.message}`);
            }
        }
        if (decryptedBooking.status === 'checked-in' && decryptedBooking.paymentProofUrl && decryptedBooking.paymentProofUrl.includes(':')) {
            try {
                decryptedBooking.paymentProofUrl = cryptoUtils.decrypt(decryptedBooking.paymentProofUrl);
            } catch (e) {
                console.warn(`Failed to decrypt paymentProofUrl for booking ${booking.id} in getBookingById: ${e.message}`);
            }
        }

        if (decryptedBooking.user) {
            if (decryptedBooking.user.encryptedFullName && decryptedBooking.user.encryptedFullName.includes(':')) {
                try {
                    decryptedBooking.user.fullName = cryptoUtils.decrypt(decryptedBooking.user.encryptedFullName);
                } catch (e) {
                    console.warn(`Failed to decrypt user fullName for booking ${booking.id} in getBookingById: ${e.message}`);
                }
            }
            if (decryptedBooking.user.encryptedEmail && decryptedBooking.user.encryptedEmail.includes(':')) {
                try {
                    decryptedBooking.user.email = cryptoUtils.decrypt(decryptedBooking.user.encryptedEmail);
                } catch (e) {
                    console.warn(`Failed to decrypt user email for booking ${booking.id} in getBookingById: ${e.message}`);
                }
            }
            delete decryptedBooking.user.encryptedFullName;
            delete decryptedBooking.user.encryptedEmail;
        }

        res.status(200).json(decryptedBooking);
        // --- AKHIR PERUBAHAN ---

    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        res.status(500).json({ message: 'Gagal mengambil booking.', error: error.message });
    }
}


// Fungsi untuk mendapatkan semua booking berdasarkan User ID (untuk halaman profil user)
async function getBookingsByUserId(req, res) {
    const { userId } = req.params;
    if (req.userId !== parseInt(userId) && (req.userRole !== 'admin' && req.userRole !== 'loket')) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat booking user lain.' });
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: parseInt(userId) },
            include: {
                user: {
                    select: { id: true, username: true, encryptedFullName: true, encryptedEmail: true }
                },
                destination: {
                    select: { id: true, name: true, basePrice: true, location: true, currency: true }
                },
                service: {
                    select: { id: true, name: true, price: true }
                },
                testimonial: true, // <--- BARU: Sertakan testimonial jika ada
            },
            orderBy: {
                bookingDate: 'desc'
            }
        });

        const decryptedBookings = bookings.map(booking => {
            let decryptedCustomerTransactionNumber = booking.customerTransactionNumber;
            let decryptedPaymentProofUrl = booking.paymentProofUrl;

            if (booking.status === 'checked-in' && booking.customerTransactionNumber && booking.customerTransactionNumber.includes(':')) {
                try {
                    decryptedCustomerTransactionNumber = cryptoUtils.decrypt(booking.customerTransactionNumber);
                } catch (e) {
                    console.warn(`Failed to decrypt customerTransactionNumber for booking ${booking.id}: ${e.message}`);
                    decryptedCustomerTransactionNumber = booking.customerTransactionNumber;
                }
            }
            if (booking.status === 'checked-in' && booking.paymentProofUrl && booking.paymentProofUrl.includes(':')) {
                try {
                    decryptedPaymentProofUrl = cryptoUtils.decrypt(booking.paymentProofUrl);
                } catch (e) {
                    console.warn(`Failed to decrypt paymentProofUrl for booking ${booking.id}: ${e.message}`);
                    decryptedPaymentProofUrl = booking.paymentProofUrl;
                }
            }

            let decryptedUser = null;
            if (booking.user) {
                decryptedUser = { ...booking.user };
                if (decryptedUser.encryptedFullName && decryptedUser.encryptedFullName.includes(':')) {
                    try {
                        decryptedUser.fullName = cryptoUtils.decrypt(decryptedUser.encryptedFullName);
                    } catch (e) {
                        console.warn(`Failed to decrypt user fullName for booking ${booking.id}: ${e.message}`);
                        decryptedUser.fullName = decryptedUser.encryptedFullName;
                    }
                }
                if (decryptedUser.encryptedEmail && decryptedUser.encryptedEmail.includes(':')) {
                    try {
                        decryptedUser.email = cryptoUtils.decrypt(decryptedUser.encryptedEmail);
                    } catch (e) {
                        console.warn(`Failed to decrypt user email for booking ${booking.id}: ${e.message}`);
                        decryptedUser.email = decryptedUser.encryptedEmail;
                    }
                }
                delete decryptedUser.encryptedFullName;
                delete decryptedUser.encryptedEmail;
            }

            return {
                ...booking,
                user: decryptedUser,
                customerTransactionNumber: decryptedCustomerTransactionNumber,
                paymentProofUrl: decryptedPaymentProofUrl,
            };
        });

        res.status(200).json(decryptedBookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat booking.', error: error.message });
    }
}

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    getBookingsByUserId,
};