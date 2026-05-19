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

// --- Petugas Waste Input (shared between petugas and admin) ---
export const SAMPAH_STORAGE_KEY = "tps_rth_petugas_sampah";
export const JENIS_STORAGE_KEY  = "tps_rth_jenis_sampah";

export interface PetugasWasteEntry {
  id: string;
  tanggal: string;
  jenisSampah: string;
  beratKg: number;
  catatan: string;
  petugasNama: string;
  createdAt: string;
}

export const WASTE_HARGA_MAP: Record<string, number> = {
  "Plastik": 2000, "Kertas": 1500, "Kardus": 1500, "Koran": 1200,
  "Logam": 8000, "Besi": 8000, "Tembaga": 40000,
  "Aluminium": 15000, "Organik": 300, "Kaca": 500,
};

export function resolveHarga(jenis: string): number {
  const keys = Object.keys(WASTE_HARGA_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (jenis.toLowerCase().includes(key.toLowerCase())) return WASTE_HARGA_MAP[key];
  }
  return 1000;
}

export const seedSampahEntries: PetugasWasteEntry[] = [
  { id: "ps1",  tanggal: "2025-04-21", jenisSampah: "Plastik PET",    beratKg: 10.5, catatan: "Dari RW 01",   petugasNama: "Deni Saputra",  createdAt: "2025-04-21T08:30:00.000Z" },
  { id: "ps2",  tanggal: "2025-04-21", jenisSampah: "Kardus/Karton",  beratKg: 15.0, catatan: "Dari RW 02",   petugasNama: "Deni Saputra",  createdAt: "2025-04-21T09:00:00.000Z" },
  { id: "ps3",  tanggal: "2025-04-21", jenisSampah: "Sampah Organik", beratKg: 40.0, catatan: "",              petugasNama: "Ratna Sari",    createdAt: "2025-04-21T10:00:00.000Z" },
  { id: "ps4",  tanggal: "2025-04-22", jenisSampah: "Plastik HDPE",   beratKg: 8.0,  catatan: "Dari RW 03",   petugasNama: "Agus Santoso",  createdAt: "2025-04-22T08:00:00.000Z" },
  { id: "ps5",  tanggal: "2025-04-22", jenisSampah: "Kertas HVS",     beratKg: 12.0, catatan: "",              petugasNama: "Agus Santoso",  createdAt: "2025-04-22T08:45:00.000Z" },
  { id: "ps6",  tanggal: "2025-04-22", jenisSampah: "Aluminium",      beratKg: 1.5,  catatan: "Dari RW 05",   petugasNama: "Ratna Sari",    createdAt: "2025-04-22T09:30:00.000Z" },
  { id: "ps7",  tanggal: "2025-04-23", jenisSampah: "Plastik PET",    beratKg: 14.0, catatan: "",              petugasNama: "Deni Saputra",  createdAt: "2025-04-23T07:30:00.000Z" },
  { id: "ps8",  tanggal: "2025-04-23", jenisSampah: "Besi/Baja",      beratKg: 5.0,  catatan: "Dari RW 04",   petugasNama: "Deni Saputra",  createdAt: "2025-04-23T08:15:00.000Z" },
  { id: "ps9",  tanggal: "2025-04-23", jenisSampah: "Sampah Organik", beratKg: 55.0, catatan: "",              petugasNama: "Agus Santoso",  createdAt: "2025-04-23T09:00:00.000Z" },
  { id: "ps10", tanggal: "2025-04-23", jenisSampah: "Kaca Bening",    beratKg: 6.0,  catatan: "Hati-hati",    petugasNama: "Ratna Sari",    createdAt: "2025-04-23T10:00:00.000Z" },
  { id: "ps11", tanggal: "2025-04-24", jenisSampah: "Kardus/Karton",  beratKg: 18.0, catatan: "Dari RW 02",   petugasNama: "Ratna Sari",    createdAt: "2025-04-24T08:00:00.000Z" },
  { id: "ps12", tanggal: "2025-04-24", jenisSampah: "Plastik Kresek", beratKg: 4.5,  catatan: "",              petugasNama: "Agus Santoso",  createdAt: "2025-04-24T09:00:00.000Z" },
  { id: "ps13", tanggal: "2025-04-25", jenisSampah: "Aluminium",      beratKg: 2.0,  catatan: "",              petugasNama: "Deni Saputra",  createdAt: "2025-04-25T08:00:00.000Z" },
  { id: "ps14", tanggal: "2025-04-25", jenisSampah: "Plastik PET",    beratKg: 11.0, catatan: "Dari RW 01",   petugasNama: "Deni Saputra",  createdAt: "2025-04-25T08:30:00.000Z" },
  { id: "ps15", tanggal: "2025-04-25", jenisSampah: "Koran/Majalah",  beratKg: 9.0,  catatan: "",              petugasNama: "Ratna Sari",    createdAt: "2025-04-25T09:15:00.000Z" },
  { id: "ps16", tanggal: "2025-04-28", jenisSampah: "Plastik PET",    beratKg: 12.5, catatan: "Dari RW 02",   petugasNama: "Deni Saputra",  createdAt: "2025-04-28T09:00:00.000Z" },
  { id: "ps17", tanggal: "2025-04-28", jenisSampah: "Kardus/Karton",  beratKg: 8.0,  catatan: "Dari RW 03",   petugasNama: "Deni Saputra",  createdAt: "2025-04-28T09:30:00.000Z" },
  { id: "ps18", tanggal: "2025-04-28", jenisSampah: "Aluminium",      beratKg: 2.3,  catatan: "",              petugasNama: "Agus Santoso",  createdAt: "2025-04-28T10:00:00.000Z" },
  { id: "ps19", tanggal: "2025-04-29", jenisSampah: "Sampah Organik", beratKg: 62.0, catatan: "",              petugasNama: "Ratna Sari",    createdAt: "2025-04-29T08:00:00.000Z" },
  { id: "ps20", tanggal: "2025-04-29", jenisSampah: "Plastik PET",    beratKg: 9.5,  catatan: "Dari RW 04",   petugasNama: "Agus Santoso",  createdAt: "2025-04-29T08:45:00.000Z" },
  { id: "ps21", tanggal: "2025-04-29", jenisSampah: "Besi/Baja",      beratKg: 7.5,  catatan: "",              petugasNama: "Deni Saputra",  createdAt: "2025-04-29T09:30:00.000Z" },
  { id: "ps22", tanggal: "2025-04-30", jenisSampah: "Kertas HVS",     beratKg: 16.0, catatan: "",              petugasNama: "Deni Saputra",  createdAt: "2025-04-30T08:00:00.000Z" },
  { id: "ps23", tanggal: "2025-04-30", jenisSampah: "Plastik HDPE",   beratKg: 7.0,  catatan: "Dari RW 03",   petugasNama: "Ratna Sari",    createdAt: "2025-04-30T08:45:00.000Z" },
  { id: "ps24", tanggal: "2025-04-30", jenisSampah: "Kaca Bening",    beratKg: 4.5,  catatan: "Kondisi baik", petugasNama: "Agus Santoso",  createdAt: "2025-04-30T09:30:00.000Z" },
  { id: "ps25", tanggal: "2025-05-02", jenisSampah: "Plastik PET",    beratKg: 13.0, catatan: "",              petugasNama: "Deni Saputra",  createdAt: "2025-05-02T08:00:00.000Z" },
  { id: "ps26", tanggal: "2025-05-02", jenisSampah: "Sampah Organik", beratKg: 48.0, catatan: "",              petugasNama: "Ratna Sari",    createdAt: "2025-05-02T08:45:00.000Z" },
  { id: "ps27", tanggal: "2025-05-02", jenisSampah: "Aluminium",      beratKg: 1.8,  catatan: "Bersih",       petugasNama: "Agus Santoso",  createdAt: "2025-05-02T09:30:00.000Z" },
  { id: "ps28", tanggal: "2025-05-05", jenisSampah: "Plastik PET",    beratKg: 12.0, catatan: "Dari RW 01",   petugasNama: "Deni Saputra",  createdAt: "2025-05-05T08:00:00.000Z" },
  { id: "ps29", tanggal: "2025-05-05", jenisSampah: "Kardus/Karton",  beratKg: 20.0, catatan: "",              petugasNama: "Agus Santoso",  createdAt: "2025-05-05T08:30:00.000Z" },
  { id: "ps30", tanggal: "2025-05-05", jenisSampah: "Sampah Organik", beratKg: 70.0, catatan: "",              petugasNama: "Ratna Sari",    createdAt: "2025-05-05T09:00:00.000Z" },
];

// --- Izin & Cuti ---
export interface IzinCutiEntry {
  id: string;
  staffId: string;
  namaPetugas: string;
  jabatan: string;
  jenis: "Izin" | "Cuti";
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  status: "menunggu" | "disetujui" | "ditolak";
  diajukanPada: string;
}

export const izinCutiData: IzinCutiEntry[] = [
  { id: "ic1",  staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", jenis: "Cuti",  tanggalMulai: "2025-05-20", tanggalSelesai: "2025-05-23", alasan: "Liburan keluarga",             status: "menunggu",  diajukanPada: "2025-05-06T08:00:00.000Z" },
  { id: "ic2",  staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jenis: "Cuti",  tanggalMulai: "2025-05-10", tanggalSelesai: "2025-05-12", alasan: "Keperluan keluarga",           status: "menunggu",  diajukanPada: "2025-05-05T09:00:00.000Z" },
  { id: "ic3",  staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jenis: "Cuti",  tanggalMulai: "2025-06-02", tanggalSelesai: "2025-06-04", alasan: "Mudik Lebaran",                status: "menunggu",  diajukanPada: "2025-05-01T09:20:00.000Z" },
  { id: "ic4",  staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            jenis: "Cuti",  tanggalMulai: "2025-06-05", tanggalSelesai: "2025-06-07", alasan: "Mudik Lebaran keluarga besar", status: "menunggu",  diajukanPada: "2025-05-02T13:00:00.000Z" },
  { id: "ic5",  staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jenis: "Izin",  tanggalMulai: "2025-05-08", tanggalSelesai: "2025-05-08", alasan: "Sakit — perlu istirahat",      status: "disetujui", diajukanPada: "2025-05-07T07:30:00.000Z" },
  { id: "ic6",  staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           jenis: "Cuti",  tanggalMulai: "2025-05-15", tanggalSelesai: "2025-05-17", alasan: "Pernikahan saudara",           status: "disetujui", diajukanPada: "2025-05-04T10:15:00.000Z" },
  { id: "ic7",  staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          jenis: "Izin",  tanggalMulai: "2025-05-07", tanggalSelesai: "2025-05-07", alasan: "Kontrol kesehatan rutin",      status: "disetujui", diajukanPada: "2025-05-06T11:30:00.000Z" },
  { id: "ic8",  staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jenis: "Izin",  tanggalMulai: "2025-04-22", tanggalSelesai: "2025-04-22", alasan: "Rapat luar kantor",            status: "disetujui", diajukanPada: "2025-04-21T16:00:00.000Z" },
  { id: "ic9",  staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           jenis: "Izin",  tanggalMulai: "2025-04-28", tanggalSelesai: "2025-04-28", alasan: "Anak sakit",                   status: "disetujui", diajukanPada: "2025-04-28T06:45:00.000Z" },
  { id: "ic10", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            jenis: "Izin",  tanggalMulai: "2025-05-06", tanggalSelesai: "2025-05-06", alasan: "Urusan administrasi bank",     status: "ditolak",   diajukanPada: "2025-05-05T14:00:00.000Z" },
];

// --- Jadwal Kerja ---
export const JADWAL_STORAGE_KEY = "tps_rth_jadwal_kerja";

export interface JadwalEntry {
  id: string;
  tanggal: string;
  staffId: string;
  namaPetugas: string;
  jabatan: string;
  shift: "Pagi" | "Sore" | "Malam" | "Libur";
}

export const seedJadwalEntries: JadwalEntry[] = [
  { id: "jd1",  tanggal: "2025-05-05", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                shift: "Pagi" },
  { id: "jd2",  tanggal: "2025-05-05", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          shift: "Pagi" },
  { id: "jd3",  tanggal: "2025-05-05", staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           shift: "Sore" },
  { id: "jd4",  tanggal: "2025-05-05", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            shift: "Libur" },
  { id: "jd5",  tanggal: "2025-05-05", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", shift: "Pagi" },
  { id: "jd6",  tanggal: "2025-05-05", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          shift: "Malam" },
  { id: "jd7",  tanggal: "2025-05-06", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                shift: "Pagi" },
  { id: "jd8",  tanggal: "2025-05-06", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          shift: "Libur" },
  { id: "jd9",  tanggal: "2025-05-06", staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           shift: "Pagi" },
  { id: "jd10", tanggal: "2025-05-06", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            shift: "Sore" },
  { id: "jd11", tanggal: "2025-05-06", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", shift: "Malam" },
  { id: "jd12", tanggal: "2025-05-06", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          shift: "Pagi" },
  { id: "jd13", tanggal: "2025-05-07", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                shift: "Sore" },
  { id: "jd14", tanggal: "2025-05-07", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          shift: "Pagi" },
  { id: "jd15", tanggal: "2025-05-07", staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           shift: "Libur" },
  { id: "jd16", tanggal: "2025-05-07", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            shift: "Pagi" },
  { id: "jd17", tanggal: "2025-05-07", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", shift: "Pagi" },
  { id: "jd18", tanggal: "2025-05-07", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          shift: "Sore" },
];

// --- Jadwal Harian (Calendar-based) ---
export const JADWAL_HARIAN_KEY = "tps_rth_jadwal_harian";

export interface JadwalPetugasItem {
  id: string;
  staffId: string;
  namaPetugas: string;
  jabatan: string;
  jamMulai: string;
  jamSelesai: string;
  deskripsi: string;
}

export interface JadwalHarian {
  tanggal: string;
  deskripsiTugas: string;
  petugas: JadwalPetugasItem[];
}

export const seedJadwalHarian: JadwalHarian[] = [
  {
    tanggal: "2026-05-05",
    deskripsiTugas: "Pengambilan sampah rutin RW 01–03",
    petugas: [
      { id: "jh1a", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jamMulai: "07:00", jamSelesai: "12:00", deskripsi: "Koordinasi pengambilan" },
      { id: "jh1b", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", jamMulai: "07:00", jamSelesai: "15:00", deskripsi: "Operasional lapangan" },
      { id: "jh1c", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          jamMulai: "09:00", jamSelesai: "14:00", deskripsi: "Edukasi warga RW 02" },
    ],
  },
  {
    tanggal: "2026-05-07",
    deskripsiTugas: "Sosialisasi pemilahan sampah di balai RW",
    petugas: [
      { id: "jh2a", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jamMulai: "09:00", jamSelesai: "13:00", deskripsi: "Pemandu sosialisasi" },
      { id: "jh2b", staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           jamMulai: "09:00", jamSelesai: "13:00", deskripsi: "Dokumentasi kegiatan" },
      { id: "jh2c", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            jamMulai: "10:00", jamSelesai: "13:00", deskripsi: "Pengelolaan konsumsi" },
    ],
  },
  {
    tanggal: "2026-05-12",
    deskripsiTugas: "Pengumpulan logam berat dan elektronik bekas",
    petugas: [
      { id: "jh3a", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jamMulai: "08:00", jamSelesai: "14:00", deskripsi: "Supervisi pengumpulan" },
      { id: "jh3b", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", jamMulai: "07:30", jamSelesai: "16:00", deskripsi: "Pengangkutan logam" },
    ],
  },
  {
    tanggal: "2026-05-14",
    deskripsiTugas: "Monitoring dan evaluasi TPS Cikaret",
    petugas: [
      { id: "jh4a", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          jamMulai: "09:00", jamSelesai: "15:00", deskripsi: "Pengecekan kondisi TPS" },
      { id: "jh4b", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jamMulai: "10:00", jamSelesai: "14:00", deskripsi: "Evaluasi operasional" },
    ],
  },
  {
    tanggal: "2026-05-19",
    deskripsiTugas: "Pengambilan sampah mingguan RW 01–05",
    petugas: [
      { id: "jh5a", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jamMulai: "07:00", jamSelesai: "12:00", deskripsi: "Koordinasi harian" },
      { id: "jh5b", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", jamMulai: "07:00", jamSelesai: "16:00", deskripsi: "Pengambilan RW 01-03" },
      { id: "jh5c", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            jamMulai: "08:00", jamSelesai: "15:00", deskripsi: "Pencatatan setoran" },
    ],
  },
  {
    tanggal: "2026-05-21",
    deskripsiTugas: "Monitoring kondisi TPS dan penimbangan sampah",
    petugas: [
      { id: "jh6a", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jamMulai: "09:00", jamSelesai: "14:00", deskripsi: "Monitoring kondisi TPS" },
      { id: "jh6b", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          jamMulai: "09:00", jamSelesai: "13:00", deskripsi: "Penimbangan dan pencatatan" },
    ],
  },
  {
    tanggal: "2026-05-26",
    deskripsiTugas: "Rapat koordinasi bulanan seluruh pengurus",
    petugas: [
      { id: "jh7a", staffId: "s1", namaPetugas: "Agus Santoso",     jabatan: "Ketua",                jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Memimpin rapat" },
      { id: "jh7b", staffId: "s2", namaPetugas: "Sri Wahyuni",      jabatan: "Wakil Ketua",          jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Wakil moderator" },
      { id: "jh7c", staffId: "s3", namaPetugas: "Dewi Rahayu",      jabatan: "Sekretaris",           jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Notulensi rapat" },
      { id: "jh7d", staffId: "s4", namaPetugas: "Hendra Kurniawan", jabatan: "Bendahara",            jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Laporan keuangan" },
      { id: "jh7e", staffId: "s5", namaPetugas: "Deni Saputra",     jabatan: "Koordinator Lapangan", jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Laporan lapangan" },
      { id: "jh7f", staffId: "s6", namaPetugas: "Ratna Sari",       jabatan: "Tim Edukasi",          jamMulai: "09:00", jamSelesai: "12:00", deskripsi: "Laporan edukasi" },
    ],
  },
];

// --- Iuran Per Bulan ---
export const iuranMember: IuranMember[] = [
  {id: "i1", nasabahNama: "Budi Santoso", bulan: "Maret", iuran: 75000, statusIuran: "sudah", tanggal: "1 Maret 2026"},
  {id: "i2", nasabahNama: "Budi Santoso", bulan: "April", iuran: 75000, statusIuran: "sudah", tanggal: "5 April 2026"},
  {id: "i3", nasabahNama: "Budi Santoso", bulan: "Mei",   iuran: 75000, statusIuran: "belum", tanggal: "-"},
];