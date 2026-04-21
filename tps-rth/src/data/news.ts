export type NewsCategory = "berita" | "pengumuman" | "edukasi";

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  date: string;
  bgColor: string;
  emoji: string;
}

export const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Sosialisasi Pemilahan Sampah di RW 05 Kelurahan Cikaret",
    excerpt:
      "TPS RTH Cikaret mengadakan sosialisasi pemilahan sampah yang dihadiri oleh 120 warga RW 05. Kegiatan ini bertujuan meningkatkan kesadaran masyarakat tentang pentingnya memilah sampah dari sumber.",
    content: "...",
    category: "berita",
    date: "18 April 2026",
    bgColor: "bg-green-100",
    emoji: "🌿",
  },
  {
    id: 2,
    title: "Jadwal Pengangkutan Sampah Bulan Mei 2026",
    excerpt:
      "Informasi jadwal rutin pengangkutan sampah terpilah untuk bulan Mei 2026. Mohon pastikan sampah sudah dipilah dan disiapkan sesuai jadwal yang tertera agar proses berjalan lancar.",
    content: "...",
    category: "pengumuman",
    date: "15 April 2026",
    bgColor: "bg-yellow-100",
    emoji: "📅",
  },
  {
    id: 3,
    title: "Tips Mengolah Sampah Organik Menjadi Kompos di Rumah",
    excerpt:
      "Sampah organik seperti sisa makanan dan daun-daun bisa diolah menjadi kompos yang bernilai. Pelajari cara membuat kompos sederhana menggunakan metode takakura yang mudah diterapkan di rumah.",
    content: "...",
    category: "edukasi",
    date: "12 April 2026",
    bgColor: "bg-emerald-100",
    emoji: "🌱",
  },
  {
    id: 4,
    title: "TPS RTH Cikaret Raih Penghargaan Lingkungan Kota Bogor 2026",
    excerpt:
      "Atas dedikasinya dalam pengelolaan sampah berbasis komunitas, TPS RTH Cikaret berhasil meraih penghargaan Lingkungan Hidup Terbaik dari Pemerintah Kota Bogor tahun 2026.",
    content: "...",
    category: "berita",
    date: "8 April 2026",
    bgColor: "bg-blue-100",
    emoji: "🏆",
  },
  {
    id: 5,
    title: "Perubahan Jam Operasional Mulai 1 Mei 2026",
    excerpt:
      "Demi pelayanan yang lebih optimal, terdapat penyesuaian jam operasional TPS RTH mulai tanggal 1 Mei 2026. Silakan baca pengumuman ini untuk mengetahui jadwal terbaru.",
    content: "...",
    category: "pengumuman",
    date: "5 April 2026",
    bgColor: "bg-orange-100",
    emoji: "🕐",
  },
  {
    id: 6,
    title: "Mengenal Jenis-Jenis Sampah dan Cara Memilahnya",
    excerpt:
      "Memilah sampah adalah langkah pertama yang paling penting dalam pengelolaan sampah. Artikel ini membahas perbedaan sampah organik, anorganik, dan B3 serta cara tepat memilahnya di rumah.",
    content: "...",
    category: "edukasi",
    date: "1 April 2026",
    bgColor: "bg-teal-100",
    emoji: "♻️",
  },
  {
    id: 7,
    title: "Gotong Royong Bersihkan Lingkungan RW 03 dan RW 07",
    excerpt:
      "Ratusan warga antusias mengikuti kegiatan gotong royong kebersihan lingkungan yang diinisiasi TPS RTH Cikaret. Kegiatan ini berhasil mengumpulkan lebih dari 500 kg sampah yang siap diolah.",
    content: "...",
    category: "berita",
    date: "27 Maret 2026",
    bgColor: "bg-lime-100",
    emoji: "🤝",
  },
  {
    id: 8,
    title: "Cara Mendaftar Menjadi Nasabah Bank Sampah TPS RTH",
    excerpt:
      "Tertarik bergabung sebagai nasabah bank sampah? Simak panduan lengkap cara pendaftaran, persyaratan, dan manfaat yang akan Anda dapatkan sebagai nasabah aktif TPS RTH Cikaret.",
    content: "...",
    category: "pengumuman",
    date: "22 Maret 2026",
    bgColor: "bg-cyan-100",
    emoji: "📋",
  },
  {
    id: 9,
    title: "Bahaya Sampah Plastik dan Cara Menguranginya",
    excerpt:
      "Setiap tahun jutaan ton plastik mencemari lautan dan merusak ekosistem. Pelajari dampak sampah plastik terhadap lingkungan dan langkah-langkah nyata yang bisa Anda lakukan mulai dari rumah.",
    content: "...",
    category: "edukasi",
    date: "18 Maret 2026",
    bgColor: "bg-sky-100",
    emoji: "🌊",
  },
];
