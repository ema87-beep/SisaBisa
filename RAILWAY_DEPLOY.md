## Deploy ke Railway

Project ini sudah disiapkan untuk Railway.

### 1. Push code terbaru ke GitHub

```bash
git add .
git commit -m "Prepare Railway deploy"
git push
```

### 2. Buat project di Railway

1. Login ke Railway
2. Klik `New Project`
3. Pilih `Deploy from GitHub repo`
4. Pilih repo `SisaBisa`

### 3. Tambahkan volume untuk SQLite

Karena project ini masih pakai SQLite, kamu harus menambahkan volume supaya data tidak hilang saat deploy ulang.

1. Buka service project di Railway
2. Masuk ke tab `Settings`
3. Cari `Volumes`
4. Tambah volume baru
5. Mount path yang dipakai:

```text
/data
```

Server akan otomatis menyimpan database SQLite ke volume Railway kalau mount path tersedia.

### 4. Tambahkan environment variable

Di Railway, buka tab `Variables`, lalu tambahkan:

```text
JWT_SECRET=isi-rahasia-bebas
DB_DIR=/data
```

`DB_DIR=/data` dipakai supaya file SQLite tersimpan di volume Railway.

### 5. Deploy

Setelah repo terhubung dan variables sudah diisi:

1. Trigger deploy
2. Tunggu build selesai
3. Buka domain Railway yang diberikan

### 6. Catatan

- UI dan alur website tetap sama
- Data lebih aman dibanding Render free tanpa disk
- Project ini tetap prototype; backup code tetap penting
