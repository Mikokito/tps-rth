-- Tambahan kolom status baca untuk tabel pesan (kontak masuk).
-- Jalankan lewat Supabase Dashboard > SQL Editor.

alter table public.pesan
  add column if not exists dibaca boolean not null default false;

create index if not exists idx_pesan_dibaca_created_at
  on public.pesan (dibaca, created_at desc);
