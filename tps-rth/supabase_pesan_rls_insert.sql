-- Izinkan pengunjung publik (anon) mengirim pesan lewat halaman Kontak.
-- Saat ini tabel pesan punya RLS aktif tapi tanpa policy INSERT untuk anon,
-- sehingga semua submit dari /kontak gagal dengan "row-level security policy" error.
-- Jalankan lewat Supabase Dashboard > SQL Editor.

create policy "Public dapat mengirim pesan kontak"
on public.pesan
for insert
to anon
with check (true);
