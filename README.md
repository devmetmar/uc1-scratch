# UC1 Learning Platform (Static Web)

Situs belajar interaktif **Fundamental Deep Learning + Proyek UC1** (HF Radar currents, BMKG MMS-2 P3). Bisa di-serve lokal atau di-deploy ke **GitHub Pages**.

Isi kurikulum di `src/data/curriculum.json` (Fundamental + UC1, diperkaya Study Guide Toulouse). Progres kuis tersimpan di `localStorage` browser.

Study Guide interaktif (EN): setelah deploy → `/study-guide.html` (atau tombol di hero situs).

## Jalankan lokal

```bash
cd learn-uc1-web
npm install
npm run dev
```

Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

Preview build produksi:

```bash
npm run build
npm run preview
```

## Sinkron konten dari Canvas

Setelah mengedit Canvas kurikulum:

```bash
npm run extract
```

Ini menulis ulang `src/data/curriculum.json` dari file canvas.

## Deploy ke GitHub Pages

Repo: `devmetmar/uc1-scratch`

Setelah push ke `main`, workflow **Deploy GitHub Pages** mem-build dan publish otomatis.

URL: https://devmetmar.github.io/uc1-scratch/

Settings → Pages → Source: **GitHub Actions** (sekali saja jika belum).

### Manual lokal

```bash
npm ci
npm run build
npx --yes serve dist
```

## Struktur

| Path | Fungsi |
|------|--------|
| `src/data/curriculum.json` | Modul F1–F10, U1–U12, capstone |
| `src/App.tsx` | UI silabus + kuis + progres |
| `src/components/Illustrations.tsx` | Diagram SVG |
| `scripts/extract-curriculum.cjs` | Ekstrak dari Canvas |

## Catatan

- Cut-off fakta proyek: **UC1 Draft Report Issue 3.0 (12 Juni 2026)** — Results analysis masih kosong; jangan klaim skor model final.
- AI Tutor Cursor SDK tetap di folder terpisah [`learn-uc1-tutor/`](../learn-uc1-tutor/) (butuh `CURSOR_API_KEY`), bukan bagian static site.
