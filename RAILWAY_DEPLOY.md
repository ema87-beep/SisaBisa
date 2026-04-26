## SisaBisa Online: Supabase + Railway

Project ini sekarang memakai:

- frontend React/Vite
- backend Node/Express
- database PostgreSQL

Rekomendasi paling aman:

- database di Supabase
- app di Railway

### 1. Push code terbaru ke GitHub

```bash
git add .
git commit -m "Prepare Supabase + Railway deploy"
git push
```

### 2. Buat project Supabase

1. Login ke [Supabase](https://supabase.com/)
2. Klik `New project`
3. Isi nama project
4. Isi database password
5. Tunggu project jadi

### 3. Ambil `DATABASE_URL`

Menurut dokumentasi Supabase, connection string ada di tombol `Connect` pada dashboard project. Untuk aplikasi server yang berjalan terus, kamu bisa memakai direct connection atau session pooler; kalau environment kamu butuh IPv4, pakai pooler session mode. Sumber: [Supabase connection strings](https://supabase.com/docs/reference/postgres/connection-strings)

Format umumnya:

```text
postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```

### 4. Deploy app ke Railway dari GitHub

1. Login ke [Railway](https://railway.app/)
2. Klik `New Project`
3. Pilih `Deploy from GitHub repo`
4. Pilih repo `SisaBisa`

### 5. Tambahkan variables di Railway

Di tab `Variables`, tambahkan:

```text
DATABASE_URL=isi-connection-string-dari-supabase
JWT_SECRET=isi-rahasia-bebas
```

Menurut dokumentasi Railway, variables dimasukkan dari tab `Variables` dan perubahan perlu di-deploy agar aktif. Sumber: [Railway Variables](https://docs.railway.com/variables)

### 6. Deploy ulang

Setelah variables disimpan:

1. review perubahan di Railway
2. deploy

Railway akan:

- install dependency
- build frontend
- start server Node

### 7. Cek website online

Tes:

- daftar akun pembeli baru
- login merchant yang sudah ada
- ubah lokasi toko
- tambah/edit produk
- checkout
- review

### 8. Catatan penting

- halaman login sekarang kosong, tidak menampilkan akun demo
- akun merchant seed tetap ada di database dan tetap bisa dipakai
- user umum bisa daftar sendiri dari website
