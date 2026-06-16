-- 1) ALTER TABLE: tambah kolom contoh_barang dan catatan pada jenis_sampah
alter table public.jenis_sampah
  add column if not exists contoh_barang text;

alter table public.jenis_sampah
  add column if not exists catatan text;

-- kolom kategori sebelumnya bertipe enum (waste_kategori) yang nilainya terkunci,
-- ubah jadi text bebas supaya admin bisa kelola kategori secara dinamis
alter table public.jenis_sampah
  alter column kategori type text using kategori::text;

-- 2) INSERT DATA: kosongkan data lama, isi ulang dengan standar klasifikasi terbaru
-- (kategori "Non-Daur Ulang (Residu & B3)" diganti jadi "Non-daur ulang",
--  nilai jenis teknis yang sudah ada disalin juga ke kolom "catatan" sebagai catatan tambahan)
-- waste_entries punya foreign key ke jenis_sampah, jadi ikut dikosongkan (CASCADE)
truncate table public.jenis_sampah cascade;

insert into public.jenis_sampah (kategori, nama, contoh_barang, catatan) values
  ('Plastik', 'PETE / PET (1)', 'Botol air mineral, botol minuman soda, botol minyak goreng, botol kecap bening, dan nampan (tray) biskuit.', 'PETE / PET (1)'),
  ('Plastik', 'HDPE (2)', 'Botol susu cair putih susu, botol sampo, jerigen kecil, wadah es krim, dan kantong belanja kresek tebal.', 'HDPE (2)'),
  ('Plastik', 'PVC (3)', 'Botol jus bening, botol air mineral ukuran besar, botol minyak sayur, dan plastik bening pembungkus makanan (food wrap).', 'PVC (3)'),
  ('Plastik', 'LDPE (4)', 'Kantong belanja kresek tipis, kantong pembungkus roti, bungkus makanan segar, pot yoghurt, dan botol saus/madu yang bisa dipencet.', 'LDPE (4)'),
  ('Plastik', 'PP (5)', 'Pembungkus biskuit, bungkus keripik kentang, krat botol minuman, sedotan, dan pita perekat kemasan (lakban).', 'PP (5)'),
  ('Plastik', 'PS & EPS (6)', 'Wadah makanan styrofoam, sendok/garpu plastik sekali pakai, dan gelas (cup) kopi plastik ringan.', 'PS & EPS (6)'),
  ('Plastik', 'OTHER (7)', 'Galon air mineral isi ulang yang keras dan botol susu bayi tebal.', 'OTHER (7)'),

  ('Kertas/Kardus', 'Kertas Putih', 'Kertas cetak dokumen (HVS) bekas dan buku tulis bekas.', 'Kertas Putih'),
  ('Kertas/Kardus', 'Kertas Cetak', 'Lembaran koran bekas, majalah, dan brosur promosi.', 'Kertas Cetak'),
  ('Kertas/Kardus', 'Karton / Kemasan', 'Kotak sepatu, kotak nasi (karton dupleks), kardus mi instan, dan kardus air mineral kemasan.', 'Karton / Kemasan'),
  ('Kertas/Kardus', 'Kertas Berlapis', 'Kemasan kotak susu UHT, kotak teh kemasan, dan kotak jus (kemasan Tetra Pak).', 'Kertas Berlapis'),

  ('Logam', 'Aluminium', 'Kaleng minuman ringan, kaleng soda, dan lembaran aluminium foil bekas.', 'Aluminium'),
  ('Logam', 'Seng / Kaleng', 'Kaleng susu kental manis, kaleng biskuit, kaleng sarden, dan potongan seng atap.', 'Seng / Kaleng'),
  ('Logam', 'Besi', 'Paku bekas, kawat, pipa besi leding, dan sisa perkakas besi rusak.', 'Besi'),
  ('Logam', 'Tembaga', 'Serpihan tembaga murni dan kawat kabel bekas yang sudah dikupas lapisan plastiknya.', 'Tembaga'),
  ('Logam', 'Kuningan', 'Gagang pintu rumah lama, keran air kuningan, dan gembok kuningan.', 'Kuningan'),

  ('Kaca', 'Kaca Utuh', 'Gelas kaca utuh, botol kecap utuh, dan botol sirup utuh.', 'Kaca Utuh'),
  ('Kaca', 'Kaca Pecahan', 'Pecahan kaca jendela rumah, cermin rusak, dan beling pecahan botol kaca.', 'Kaca Pecahan'),

  ('Non-daur ulang', 'Peralatan Makan Melamin', 'Piring melamin, gelas melamin, mangkok melamin, dan sendok melamin.', 'Peralatan Makan Melamin'),
  ('Non-daur ulang', 'Limbah Medis (B3)', 'Jarum suntik bekas pakai, alat suntik bekas, botol infus bekas, dan selang medis bekas.', 'Limbah Medis (B3)'),
  ('Non-daur ulang', 'Limbah Beracun & Elektronik (B3)', 'Baterai remot bekas, baterai jam tangan, aki bekas, botol bekas racun serangga, dan botol sisa cairan pembersih kimia lantai.', 'Limbah Beracun & Elektronik (B3)'),
  ('Non-daur ulang', 'Residu (Sampah Sisa Akhir)', 'Sampah yang sangat kotor dan tercampur, dan sisa akhir pengolahan di TPS 3R yang harus dibuang ke Tempat Pemrosesan Akhir (TPA).', 'Residu (Sampah Sisa Akhir)');
