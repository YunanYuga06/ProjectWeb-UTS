// File: ProjectWeb-UTS-main/Backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, encrypt } = require('../src/utils/cryptoUtils'); // <--- PASTIKAN 'encrypt' DIIMPOR DI SINI

async function main() {
  console.log('Start seeding users...');

  // Membuat user biasa (akan diperbarui jika sudah ada, atau dibuat jika belum ada)
  const dummyUserPassword = await hashPassword('testpassword');
  const encryptedDummyFullName = encrypt('Test User FunVac'); // <--- Enkripsi nama lengkap
  const encryptedDummyEmail = encrypt('test@example.com');   // <--- Enkripsi email

  const dummyUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {
        hashedPassword: dummyUserPassword,
        encryptedEmail: encryptedDummyEmail, // <--- Gunakan encryptedEmail
        encryptedFullName: encryptedDummyFullName, // <--- Gunakan encryptedFullName
        role: 'user'
    },
    create: {
      username: 'testuser',
      hashedPassword: dummyUserPassword,
      encryptedEmail: encryptedDummyEmail, // <--- Gunakan encryptedEmail
      encryptedFullName: encryptedDummyFullName, // <--- Gunakan encryptedFullName
      role: 'user'
    },
  });
  console.log(`Created/updated dummy user: ${dummyUser.username} with role: ${dummyUser.role}`);

  // Membuat user admin/loket (akan diperbarui jika sudah ada, atau dibuat jika belum ada)
  const adminUserPassword = await hashPassword('adminpassword');
  const encryptedAdminFullName = encrypt('Admin Loket Check-in'); // <--- Enkripsi nama lengkap
  const encryptedAdminEmail = encrypt('admin@example.com');     // <--- Enkripsi email

  const adminUser = await prisma.user.upsert({
    where: { username: 'adminloket' },
    update: {
        hashedPassword: adminUserPassword,
        encryptedEmail: encryptedAdminEmail, // <--- Gunakan encryptedEmail
        encryptedFullName: encryptedAdminFullName, // <--- Gunakan encryptedFullName
        role: 'loket'
    },
    create: {
      username: 'adminloket',
      hashedPassword: adminUserPassword,
      encryptedEmail: encryptedAdminEmail, // <--- Gunakan encryptedEmail
      encryptedFullName: encryptedAdminFullName, // <--- Gunakan encryptedFullName
      role: 'loket'
    },
  });
  console.log(`Created/updated admin user: ${adminUser.username} with role: ${adminUser.role}`);

  console.log('User seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });