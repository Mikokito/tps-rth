export interface WasteEntry {
  id: string;
  tanggal: string;
  nasabahNama: string;
  rw: string;
  rt: string;
  jenisSampah: string;
  beratKg: number;
  hargaPerKg: number;
  total: number;
}

export interface StaffMember {
  id: string;
  nama: string;
  jabatan: string;
  rw: string;
  rt: string;
  hp: string;
  gajiPokok: number;
  statusGaji: "sudah" | "belum";
  bulan: string;
}

export interface Member {
  id: string;
  nama: string;
  rw: string;
  rt: string;
  email: string;
  hp: string;
  alamat: string;
  totalIuran: number;
  statusAktif: boolean;
  bergabungTanggal: string;
  statusIuran: "sudah" | "belum";
}

export interface WastePrice {
  id: string;
  jenis: string;
  kategori: string;
  hargaPerKg: number;
}

export interface LaporanItem {
  id: string;
  judul: string;
  tanggal: string;
  tipe: "PDF" | "XLSX" | "DOCX";
  ukuran: string;
}

export interface JenisSampah {
  id: string;
  nama: string;
  kategori: string;
}

export interface AbsenEntry {
  id: string;
  tanggal: string;
  staffId: string;
  nama: string;
  jabatan: string;
  status: "hadir" | "izin" | "absen";
  lastModified: string;
}

export interface IuranMember {
  id: string;
  nasabahNama: string;
  bulan: string;
  iuran: number;
  statusIuran: "sudah" | "belum";
  tanggal: string;
}

// --- Waste Entries (last 30 entries) ---
export const wasteEntries: WasteEntry[] = [
  { id: "w1",  tanggal: "2025-04-28", nasabahNama: "Budi Santoso",    rw: "03", rt: "05", jenisSampah: "Plastik",       beratKg: 3.2,  hargaPerKg: 2000, total: 6400 },
  { id: "w2",  tanggal: "2025-04-28", nasabahNama: "Siti Rahayu",     rw: "02", rt: "03", jenisSampah: "Kertas",        beratKg: 5.0,  hargaPerKg: 1500, total: 7500 },
  { id: "w3",  tanggal: "2025-04-27", nasabahNama: "Agus Pratama",    rw: "01", rt: "02", jenisSampah: "Logam",         beratKg: 1.5,  hargaPerKg: 8000, total: 12000 },
  { id: "w4",  tanggal: "2025-04-27", nasabahNama: "Dewi Lestari",    rw: "04", rt: "01", jenisSampah: "Plastik",       beratKg: 2.8,  hargaPerKg: 2000, total: 5600 },
  { id: "w5",  tanggal: "2025-04-26", nasabahNama: "Hendra Putra",    rw: "02", rt: "04", jenisSampah: "Kaca",          beratKg: 4.0,  hargaPerKg: 500,  total: 2000 },
  { id: "w6",  tanggal: "2025-04-26", nasabahNama: "Rina Wati",       rw: "03", rt: "02", jenisSampah: "Organik",       beratKg: 8.5,  hargaPerKg: 300,  total: 2550 },
  { id: "w7",  tanggal: "2025-04-25", nasabahNama: "Joko Widodo",     rw: "01", rt: "03", jenisSampah: "Kertas",        beratKg: 6.2,  hargaPerKg: 1500, total: 9300 },
  { id: "w8",  tanggal: "2025-04-25", nasabahNama: "Ani Sukarti",     rw: "05", rt: "01", jenisSampah: "Plastik",       beratKg: 1.9,  hargaPerKg: 2000, total: 3800 },
  { id: "w9",  tanggal: "2025-04-24", nasabahNama: "Rizky Fauzan",    rw: "02", rt: "02", jenisSampah: "Aluminium",     beratKg: 0.8,  hargaPerKg: 15000, total: 12000 },
  { id: "w10", tanggal: "2025-04-24", nasabahNama: "Yuni Astuti",     rw: "03", rt: "04", jenisSampah: "Kertas",        beratKg: 3.5,  hargaPerKg: 1500, total: 5250 },
  { id: "w11", tanggal: "2025-04-23", nasabahNama: "Doni Setiawan",   rw: "04", rt: "03", jenisSampah: "Plastik",       beratKg: 4.1,  hargaPerKg: 2000, total: 8200 },
  { id: "w12", tanggal: "2025-04-23", nasabahNama: "Maya Indah",      rw: "01", rt: "01", jenisSampah: "Logam",         beratKg: 2.2,  hargaPerKg: 8000, total: 17600 },
  { id: "w13", tanggal: "2025-04-22", nasabahNama: "Budi Santoso",    rw: "03", rt: "05", jenisSampah: "Organik",       beratKg: 7.0,  hargaPerKg: 300,  total: 2100 },
  { id: "w14", tanggal: "2025-04-22", nasabahNama: "Sri Handayani",   rw: "02", rt: "01", jenisSampah: "Kertas",        beratKg: 4.8,  hargaPerKg: 1500, total: 7200 },
  { id: "w15", tanggal: "2025-04-21", nasabahNama: "Wahyu Purnomo",   rw: "05", rt: "02", jenisSampah: "Plastik",       beratKg: 3.3,  hargaPerKg: 2000, total: 6600 },
  { id: "w16", tanggal: "2025-04-21", nasabahNama: "Eko Prasetyo",    rw: "01", rt: "04", jenisSampah: "Aluminium",     beratKg: 1.1,  hargaPerKg: 15000, total: 16500 },
  { id: "w17", tanggal: "2025-04-20", nasabahNama: "Lina Susanti",    rw: "03", rt: "01", jenisSampah: "Kaca",          beratKg: 5.5,  hargaPerKg: 500,  total: 2750 },
  { id: "w18", tanggal: "2025-04-19", nasabahNama: "Rizky Fauzan",    rw: "02", rt: "02", jenisSampah: "Kertas",        beratKg: 3.0,  hargaPerKg: 1500, total: 4500 },
  { id: "w19", tanggal: "2025-04-19", nasabahNama: "Agus Pratama",    rw: "01", rt: "02", jenisSampah: "Plastik",       beratKg: 2.5,  hargaPerKg: 2000, total: 5000 },
  { id: "w20", tanggal: "2025-04-18", nasabahNama: "Dewi Lestari",    rw: "04", rt: "01", jenisSampah: "Logam",         beratKg: 3.0,  hargaPerKg: 8000, total: 24000 },
];

// Chart summary — weight per type for current month
export const sampahByType = [
  { label: "Plastik",   kg: 17.8, color: "#3B82F6" },
  { label: "Kertas",    kg: 22.5, color: "#F59E0B" },
  { label: "Logam",     kg: 6.7,  color: "#6B7280" },
  { label: "Aluminium", kg: 1.9,  color: "#8B5CF6" },
  { label: "Organik",   kg: 15.5, color: "#10B981" },
  { label: "Kaca",      kg: 9.5,  color: "#06B6D4" },
];

// Weight per day (last 7 days) for bar chart
export const sampahHarian = [
  { hari: "Sen 21",  kg: 12.4 },
  { hari: "Sel 22",  kg: 11.8 },
  { hari: "Rab 23",  kg: 25.8 },
  { hari: "Kam 24",  kg: 4.3  },
  { hari: "Jum 25",  kg: 8.1  },
  { hari: "Sab 26",  kg: 12.5 },
  { hari: "Min 27",  kg: 6.5  },
];

// --- Staff / Pengurus ---
export const staffMembers: StaffMember[] = [
  { id: "s1", nama: "Agus Santoso",    jabatan: "Ketua",                rw: "01", rt: "02", hp: "081111111111", gajiPokok: 1500000, statusGaji: "sudah", bulan: "April 2025" },
  { id: "s2", nama: "Sri Wahyuni",     jabatan: "Wakil Ketua",          rw: "02", rt: "01", hp: "081222222222", gajiPokok: 1200000, statusGaji: "sudah", bulan: "April 2025" },
  { id: "s3", nama: "Dewi Rahayu",     jabatan: "Sekretaris",           rw: "01", rt: "03", hp: "081333333333", gajiPokok: 1000000, statusGaji: "belum", bulan: "April 2025" },
  { id: "s4", nama: "Hendra Kurniawan",jabatan: "Bendahara",            rw: "03", rt: "02", hp: "081444444444", gajiPokok: 1000000, statusGaji: "belum", bulan: "April 2025" },
  { id: "s5", nama: "Deni Saputra",    jabatan: "Koordinator Lapangan", rw: "02", rt: "04", hp: "081555555555", gajiPokok: 1100000, statusGaji: "sudah", bulan: "April 2025" },
  { id: "s6", nama: "Ratna Sari",      jabatan: "Tim Edukasi",          rw: "04", rt: "01", hp: "081666666666", gajiPokok: 900000,  statusGaji: "belum", bulan: "April 2025" },
];

// --- Members / Nasabah ---
export const members: Member[] = [
  { id: "m1",  nama: "Budi Santoso",     rw: "03", rt: "05", email: "budi@example.com",   hp: "08100000001", alamat: "Jl. Mawar No. 1, Cikaret",        totalIuran: 150000,  statusAktif: true,  bergabungTanggal: "2023-01-15", statusIuran: "sudah" },
  { id: "m2",  nama: "Siti Rahayu",      rw: "02", rt: "03", email: "siti@example.com",   hp: "08100000002", alamat: "Jl. Melati No. 5, Cikaret",       totalIuran: 320000,  statusAktif: true,  bergabungTanggal: "2022-08-20", statusIuran: "sudah" },
  { id: "m3",  nama: "Agus Pratama",     rw: "01", rt: "02", email: "agus@example.com",   hp: "08100000003", alamat: "Jl. Anggrek No. 3, Cikaret",      totalIuran: 85000,   statusAktif: true,  bergabungTanggal: "2024-03-10", statusIuran: "belum" },
  { id: "m4",  nama: "Dewi Lestari",     rw: "04", rt: "01", email: "dewi@example.com",   hp: "08100000004", alamat: "Jl. Kenanga No. 7, Cikaret",      totalIuran: 210000,  statusAktif: true,  bergabungTanggal: "2023-06-05", statusIuran: "sudah" },
  { id: "m5",  nama: "Hendra Putra",     rw: "02", rt: "04", email: "hendra@example.com", hp: "08100000005", alamat: "Jl. Dahlia No. 2, Cikaret",       totalIuran: 0,       statusAktif: false, bergabungTanggal: "2022-11-30", statusIuran: "belum" },
  { id: "m6",  nama: "Rina Wati",        rw: "03", rt: "02", email: "rina@example.com",   hp: "08100000006", alamat: "Jl. Seruni No. 4, Cikaret",       totalIuran: 460000,  statusAktif: true,  bergabungTanggal: "2022-05-12", statusIuran: "sudah" },
  { id: "m7",  nama: "Joko Widodo",      rw: "01", rt: "03", email: "joko@example.com",   hp: "08100000007", alamat: "Jl. Cempaka No. 9, Cikaret",      totalIuran: 175000,  statusAktif: true,  bergabungTanggal: "2023-09-22", statusIuran: "belum" },
  { id: "m8",  nama: "Ani Sukarti",      rw: "05", rt: "01", email: "ani@example.com",    hp: "08100000008", alamat: "Jl. Kamboja No. 6, Cikaret",      totalIuran: 95000,   statusAktif: true,  bergabungTanggal: "2024-01-08", statusIuran: "sudah" },
  { id: "m9",  nama: "Rizky Fauzan",     rw: "02", rt: "02", email: "rizky@example.com",  hp: "08100000009", alamat: "Jl. Flamboyan No. 8, Cikaret",    totalIuran: 280000,  statusAktif: true,  bergabungTanggal: "2023-04-17", statusIuran: "sudah" },
  { id: "m10", nama: "Yuni Astuti",      rw: "03", rt: "04", email: "yuni@example.com",   hp: "08100000010", alamat: "Jl. Tulip No. 11, Cikaret",       totalIuran: 0,       statusAktif: false, bergabungTanggal: "2023-02-28", statusIuran: "belum" },
  { id: "m11", nama: "Doni Setiawan",    rw: "04", rt: "03", email: "doni@example.com",   hp: "08100000011", alamat: "Jl. Aster No. 10, Cikaret",       totalIuran: 120000,  statusAktif: true,  bergabungTanggal: "2023-12-01", statusIuran: "belum" },
  { id: "m12", nama: "Maya Indah",       rw: "01", rt: "01", email: "maya@example.com",   hp: "08100000012", alamat: "Jl. Bougenville No. 14, Cikaret", totalIuran: 540000,  statusAktif: true,  bergabungTanggal: "2022-03-15", statusIuran: "sudah" },
];

// --- Waste Prices ---
export const wastePrices: WastePrice[] = [
  { id: "p1",  jenis: "Plastik PET (Botol)",    kategori: "Plastik",   hargaPerKg: 3000  },
  { id: "p2",  jenis: "Plastik HDPE (Ember)",   kategori: "Plastik",   hargaPerKg: 2500  },
  { id: "p3",  jenis: "Plastik Kresek/Kantong", kategori: "Plastik",   hargaPerKg: 500   },
  { id: "p4",  jenis: "Kertas HVS",             kategori: "Kertas",    hargaPerKg: 2000  },
  { id: "p5",  jenis: "Kardus/Karton",          kategori: "Kertas",    hargaPerKg: 1500  },
  { id: "p6",  jenis: "Koran/Majalah",          kategori: "Kertas",    hargaPerKg: 1200  },
  { id: "p7",  jenis: "Besi/Baja",              kategori: "Logam",     hargaPerKg: 5000  },
  { id: "p8",  jenis: "Aluminium",              kategori: "Logam",     hargaPerKg: 15000 },
  { id: "p9",  jenis: "Tembaga",                kategori: "Logam",     hargaPerKg: 40000 },
  { id: "p10", jenis: "Kaca Bening",            kategori: "Kaca",      hargaPerKg: 700   },
  { id: "p11", jenis: "Kaca Berwarna",          kategori: "Kaca",      hargaPerKg: 400   },
  { id: "p12", jenis: "Sampah Organik",         kategori: "Organik",   hargaPerKg: 300   },
];

// --- Laporan ---
export const laporanItems: LaporanItem[] = [
  { id: "l1", judul: "Laporan Keuangan Maret 2025",       tanggal: "2025-04-05", tipe: "PDF",  ukuran: "1.2 MB" },
  { id: "l2", judul: "Rekap Setoran Sampah Maret 2025",   tanggal: "2025-04-03", tipe: "XLSX", ukuran: "320 KB" },
  { id: "l3", judul: "Laporan Keuangan Februari 2025",    tanggal: "2025-03-05", tipe: "PDF",  ukuran: "1.1 MB" },
  { id: "l4", judul: "Rekap Setoran Sampah Feb 2025",     tanggal: "2025-03-03", tipe: "XLSX", ukuran: "290 KB" },
  { id: "l5", judul: "Laporan Tahunan 2024",              tanggal: "2025-01-20", tipe: "PDF",  ukuran: "4.8 MB" },
  { id: "l6", judul: "Rekap Data Nasabah Q4 2024",        tanggal: "2025-01-10", tipe: "XLSX", ukuran: "410 KB" },
];

// --- Attendance ---
export const absenRecords: AbsenEntry[] = [
  { id: "a1",  tanggal: "2025-04-28", staffId: "s1", nama: "Agus Santoso",     jabatan: "Ketua",                status: "hadir", lastModified: "2025-04-28T08:30:00.000Z" },
  { id: "a2",  tanggal: "2025-04-28", staffId: "s2", nama: "Sri Wahyuni",      jabatan: "Wakil Ketua",          status: "hadir", lastModified: "2025-04-28T08:31:00.000Z" },
  { id: "a3",  tanggal: "2025-04-28", staffId: "s3", nama: "Dewi Rahayu",      jabatan: "Sekretaris",           status: "izin",  lastModified: "2025-04-28T08:32:00.000Z" },
  { id: "a4",  tanggal: "2025-04-28", staffId: "s4", nama: "Hendra Kurniawan", jabatan: "Bendahara",            status: "hadir", lastModified: "2025-04-28T08:33:00.000Z" },
  { id: "a5",  tanggal: "2025-04-28", staffId: "s5", nama: "Deni Saputra",     jabatan: "Koordinator Lapangan", status: "hadir", lastModified: "2025-04-28T08:34:00.000Z" },
  { id: "a6",  tanggal: "2025-04-28", staffId: "s6", nama: "Ratna Sari",       jabatan: "Tim Edukasi",          status: "izin",  lastModified: "2025-04-28T08:35:00.000Z" },
  { id: "a7",  tanggal: "2025-04-25", staffId: "s1", nama: "Agus Santoso",     jabatan: "Ketua",                status: "hadir", lastModified: "2025-04-25T08:15:00.000Z" },
  { id: "a8",  tanggal: "2025-04-25", staffId: "s2", nama: "Sri Wahyuni",      jabatan: "Wakil Ketua",          status: "hadir", lastModified: "2025-04-25T08:16:00.000Z" },
  { id: "a9",  tanggal: "2025-04-25", staffId: "s3", nama: "Dewi Rahayu",      jabatan: "Sekretaris",           status: "hadir", lastModified: "2025-04-25T08:17:00.000Z" },
  { id: "a10", tanggal: "2025-04-25", staffId: "s4", nama: "Hendra Kurniawan", jabatan: "Bendahara",            status: "hadir", lastModified: "2025-04-25T08:18:00.000Z" },
  { id: "a11", tanggal: "2025-04-25", staffId: "s5", nama: "Deni Saputra",     jabatan: "Koordinator Lapangan", status: "absen", lastModified: "2025-04-25T08:19:00.000Z" },
  { id: "a12", tanggal: "2025-04-25", staffId: "s6", nama: "Ratna Sari",       jabatan: "Tim Edukasi",          status: "hadir", lastModified: "2025-04-25T08:20:00.000Z" },
];

// --- Jenis Sampah (manageable list) ---
export const jenisData: JenisSampah[] = [
  { id: "j1",  nama: "Plastik PET",     kategori: "Plastik" },
  { id: "j2",  nama: "Plastik HDPE",    kategori: "Plastik" },
  { id: "j3",  nama: "Plastik Kresek",  kategori: "Plastik" },
  { id: "j4",  nama: "Kertas HVS",      kategori: "Kertas"  },
  { id: "j5",  nama: "Kardus/Karton",   kategori: "Kertas"  },
  { id: "j6",  nama: "Koran/Majalah",   kategori: "Kertas"  },
  { id: "j7",  nama: "Besi/Baja",       kategori: "Logam"   },
  { id: "j8",  nama: "Aluminium",       kategori: "Logam"   },
  { id: "j9",  nama: "Tembaga",         kategori: "Logam"   },
  { id: "j10", nama: "Kaca Bening",     kategori: "Kaca"    },
  { id: "j11", nama: "Kaca Berwarna",   kategori: "Kaca"    },
  { id: "j12", nama: "Sampah Organik",  kategori: "Organik" },
];

// --- Iuran Per Bulan ---
export const iuranMember: IuranMember[] = [
  {id: "i1", nasabahNama: "Budi Santoso", bulan: "Maret", iuran: 75000, statusIuran: "sudah", tanggal: "1 Maret 2026"},
  {id: "i2", nasabahNama: "Budi Santoso", bulan: "April", iuran: 75000, statusIuran: "sudah", tanggal: "5 April 2026"},
  {id: "i3", nasabahNama: "Budi Santoso", bulan: "Mei",   iuran: 75000, statusIuran: "belum", tanggal: "-"},
];