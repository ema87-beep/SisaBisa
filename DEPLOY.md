# Deploy SisaBisa

## Lokal

```bash
npm install
npm run dev
```

## Push ke GitHub

```bash
git init
git add .
git commit -m "Initial SisaBisa app"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

## Deploy online di Render

1. Push project ke GitHub.
2. Login ke Render.
3. Klik `New` -> `Blueprint`.
4. Pilih repo GitHub project ini.
5. Render akan membaca file `render.yaml`.
6. Tunggu proses build selesai.

App akan online dalam satu service:
- frontend React dari folder `dist`
- backend Express API dari `server/index.js`
- database SQLite memakai persistent disk Render

## Edit setelah online

1. Edit code di VS Code.
2. Commit lalu `git push`.
3. Render akan deploy ulang otomatis.
