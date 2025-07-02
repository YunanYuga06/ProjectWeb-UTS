const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hapus semua data destinasi sebelumnya
  await prisma.destination.deleteMany({});
  console.log('Deleted existing destination data.');

  const destinations = [
    {
      name: 'Batturaden Adventure Forest',
      shortDescription: 'Taman petualangan yang luas di hutan Baturraden dengan berbagai aktivitas outdoor.',
      longDescription: 'BATURADEN ADVENTURE FOREST adalah pilihan tepat bagi Anda yang ingin liburan dengan konsep outdoor. Baturraden sudah terkenal dengan pesonanya yang menggabungkan empat unsur alam, yaitu gunung, sungai, hutan dan kabut. Keempat unsur tersebut diwujudkan dalam berbagai jenis petualangan fisik (physical adventure) dan petualangan wawasan (mind adventure) dalam berbagai kegiatan seperti Mountain Adventure, Water Adventure, Tree Adventure & Eco Adventure.',
      imageUrl: 'https://img.inews.co.id/media/1200/files/inews_new/2023/03/30/Baturraden__Adventure__Forest.jpg',
      cardImageUrl: '/assets/images/card-image.jpg',
      location: 'Karangsalam, Baturaden, Banyumas',
      temperatureRange: null,
      altitude: null,
      categories: 'Adventure',
      features: null,
      basePrice: 27635,
      currency: 'IDR'
    },
    {
      name: 'Penak Mawon',
      shortDescription: 'Cafe dengan pemandangan sungai yang indah, menawarkan hidangan khas Indonesia dan camilan.',
      longDescription: 'Rekomendasi cafe view sungai yang pertama yaitu PENAK MAWON. Terletak di Jalan Raya Kebumen, Dusun II Kebumen, Barurraden, Penak Mawon menawarkan pengalaman bersantap yang istimewa di tepi sungai. Untuk hidangan berat, tersedia berbagai macam hidangan khas Indonesia seperti Nasi Goreng Spesial, Nasi Ayam Goreng, Nasi Ayam Bakar, Nasi Ayam Penyet, Nasi Bebek Penyet, Nasi Lele Penyet, Kangkung Asap, Bakmi Goreng, dan Bakmi Kuah. Sementara itu, dalam kategori makanan ringan, pengunjung dapat menikmati hidangan seperti Mendoan, Dage Goreng, Pisang Goreng, dan Roti Bakar. Harga menu makanan berkisar antara Rp. 8.000 hingga Rp. 35.000.',
      imageUrl: '/assets/images/destination-detail-02.jpg',
      cardImageUrl: '/assets/images/card-image1.webp',
      location: 'Kebumen, Baturaden, Banyumas',
      temperatureRange: null,
      altitude: null,
      categories: 'Culinary',
      features: null,
      basePrice: 35000,
      currency: 'IDR'
    },
    {
      name: 'Curug Telu',
      shortDescription: 'Air terjun dengan tiga tingkatan, menawarkan area berenang dan kedai camilan di dekatnya.',
      longDescription: 'Curug ini dinamakan CURUG TELU, karena ada tiga curug di areal kawasan ini. Selain curug telu yang merupakan curug terbesar, ada dua curug lain, yaitu curug lawang (sendang Bidadari) dan curug pelangi (moprok). Curug ini lokasinya ada di Karangsalam, Baturraden, Banyumas. Untuk menuju ke curug Telu, ada baiknya Wovger menggunakan motor, karena akses jalannya yang tidak memungkinkan untuk dimasuki mobil.',
      imageUrl: 'https://img.inews.co.id/media/1200/files/inews_new/2018/06/09/curugtelu.jpg',
      cardImageUrl: '/assets/images/card-image-0.jpg',
      location: 'Karangsalam, Baturaden, Banyumas',
      temperatureRange: null,
      altitude: null,
      categories: 'Refreshing',
      features: null,
      basePrice: 41929,
      currency: 'IDR'
    }
  ];

  for (const data of destinations) {
    const destination = await prisma.destination.create({ data });
    console.log(`Created destination with id: ${destination.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
