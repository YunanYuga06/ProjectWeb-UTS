// File: ProjectWeb-UTS-main/Backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET tidak ditemukan di .env. Mohon set kunci rahasia yang kuat!');
    // Fatal error jika di produksi, tapi untuk dev bisa pakai fallback
    // process.exit(1); // Uncomment ini untuk mode produksi
    process.env.JWT_SECRET = 'your_jwt_secret_fallback_for_dev_only'; // Fallback HANYA UNTUK DEV.
}

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token otentikasi tidak disediakan atau format tidak valid.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.userId = decodedToken.userId;     // PASTIKAN INI SESUAI DENGAN PAYLOAD SAAT TOKEN DIBUAT
    req.username = decodedToken.username;
    req.userRole = decodedToken.role;

    console.log('AuthMiddleware: Decoded Token:', decodedToken);
    console.log('AuthMiddleware: req.userId set to:', req.userId);
    console.log('AuthMiddleware: req.userRole set to:', req.userRole);

    next();
  } catch (error) {
    console.error('AuthMiddleware Error: Token verification failed:', error.message);
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
};