/**
 * Enrich curriculum.json with MMS2 UC1 Study Guide material (Bahasa Indonesia).
 * Idempotent: safe to re-run (uses markers / quiz ids).
 */
const fs = require("fs");
const path = require("path");

const jsonPath = path.resolve(__dirname, "../src/data/curriculum.json");
const c = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function mod(id) {
  const m = c.modules.find((x) => x.id === id);
  if (!m) throw new Error("missing " + id);
  return m;
}

function upsertSection(m, heading, body) {
  const i = m.sections.findIndex((s) => s.heading === heading);
  if (i >= 0) m.sections[i].body = body;
  else m.sections.push({ heading, body });
}

function appendUnique(m, heading, paragraphs) {
  let s = m.sections.find((x) => x.heading === heading);
  if (!s) {
    s = { heading, body: [] };
    m.sections.push(s);
  }
  for (const p of paragraphs) {
    if (!s.body.includes(p)) s.body.push(p);
  }
}

function upsertQuiz(m, item) {
  const i = m.quiz.findIndex((q) => q.id === item.id);
  if (i >= 0) m.quiz[i] = item;
  else m.quiz.push(item);
}

function upsertCapstone(item) {
  const i = c.capstone.findIndex((q) => q.id === item.id);
  if (i >= 0) c.capstone[i] = item;
  else c.capstone.push(item);
}

c.subtitle =
  "Kurikulum Fundamental Deep Learning + Proyek UC1 (HF Radar Currents) — MMS-2 P3 BMKG · dilengkapi Study Guide Toulouse Sep 2026";

// —— U1: glossary + week overview ——
appendUnique(mod("u01"), "Glosarium cepat (Study Guide)", [
  "Oseanografi: HFR (High-Frequency Radar), SSH (Sea Surface Height), SST, SSS, ITF (Indonesian Throughflow), CS/DS (Cross/Downstream).",
  "ML: LSTM, ConvLSTM, Attention, RMSE/MAE/R², SHAP (penjelasan kontribusi fitur).",
  "Tooling FT: PyTorch, Lightning, Kedro (pipeline), MLflow (tracking eksperimen), Milvus (vector DB untuk KNN), FES2022 (model tide).",
]);
appendUnique(mod("u01"), "Jadwal Factory Training (Toulouse)", [
  "Sen 21/9: DL Fundamentals & Training.",
  "Sel 22/9: Improving Models & Experiment Tracking.",
  "Rab 23/9: UC1 Data (extraction, analysis, preprocessing).",
  "Kam 24/9: UC1 Models & Metrics.",
  "Jum 25/9: Production & Discussions.",
  "Study Guide interaktif (EN) juga tersedia di /study-guide.html pada situs ini.",
]);

// —— U2 ——
appendUnique(mod("u02"), "Problem statement dalam satu kalimat", [
  "UC1: mengisi gap temporal HF Radar (void filling) dan forecast arus permukaan hingga ~24 jam dengan metodologi ML/DL yang sama, di Selat Sunda (Bada) dan Lombok (Sega).",
  "Alur konsep: HF Radar (10 menit, ~1 km) + tide/SSH/angin/batimetri → model DL (LSTM/ConvLSTM ± attention) → U,V terisi + forecast.",
]);

// —— U3 oceanography ——
appendUnique(mod("u03"), "Selat strategis dan konteks ITF", [
  "Sunda (Bada): sekitar 105.8–106.0°E, 6.0–5.8°S — antara Jawa & Sumatra; aliran relatif stream-like (SW/NE); tide dominan diurnal (~24 jam); batimetri relatif homogen.",
  "Lombok (Sega): sekitar 115.5–115.8°E, 8.75–8.47°S — antara Bali & Lombok; lebih kompleks karena bifurkasi Nusa Penida; tide mixed semi-diurnal (~12 jam); jalur utama ITF Pasifik→Hindia.",
  "ITF mengangkut air hangat salinitas rendah dari Pasifik ke Hindia; memengaruhi iklim regional, monsun, dan transport panas. Komponen musiman (low-frequency) arus banyak terkait ITF.",
]);
appendUnique(mod("u03"), "Monsun dan pola musiman di radar", [
  "Monsun Australia (Des–Feb): angin NW→SE → arus cenderung NE.",
  "Transisi Aus→Asia (Mar–Mei) & Asia→Aus (Sep–Nov): campuran, SW sering dominan.",
  "Monsun Asia (Jun–Agu): angin SE→NW → arus cenderung SW.",
  "Untuk model, musim diencode dengan cos/sin day-of-year agar sifat siklik tidak “putus” di pergantian tahun.",
]);
appendUnique(mod("u03"), "Tidal vs non-tidal", [
  "High-pass (periode < ~72 jam) → sinyal tidal (12h/24h). Low-pass (> ~72 jam) → non-tidal (musiman/ITF).",
  "Temuan analisis: setelah tide dihilangkan, korelasi gradien SSH dengan arus DS non-tidal naik tajam (contoh Issue 3.0: dari ~0.53 ke ~0.80) — driver berbeda untuk skala waktu berbeda.",
]);
appendUnique(mod("u03"), "Transformasi Cross-stream (CS) dan Downstream (DS)", [
  "Sudut rotasi (Issue 3.0, dari median orientasi radar): Sunda ≈ 45.21° clockwise dari Utara; Lombok ≈ 53.06° clockwise dari Utara.",
  "CS/DS lebih bermakna fisik untuk dinamika selat daripada U/V murni geografis.",
]);
upsertSection(mod("u03"), "HF Radar — cara kerja & spek UC1", [
  "HFR memancarkan radio 3–30 MHz ke permukaan laut; Doppler gelombang pantulan → kecepatan arus permukaan; output field 2D U & V.",
  "Spek UC1: resolusi spasial ~1 km (0.009°); temporal 10 menit; periode studi sekitar Apr 2023 – Des 2025; situs Bada & Sega.",
  "Masalah tipikal: gap temporal (hardware/maintenance), gap spasial (daratan/cakupan), perubahan resolusi (1 jam → 10 menit Mei 2023), gap ~3 bulan sekitar Des 2023 di kedua situs.",
  "Gap multi-hari inilah alasan utama butuh ML untuk mengisi void — interpolasi sederhana tidak cukup.",
]);

// —— U4 variables ——
appendUnique(mod("u04"), "Daftar input yang dipakai pipeline", [
  "Current U,V (HF Radar MMS): ~1 km / 10 menit — target utama + histori sebagai input.",
  "Tide (FES2022): ~1 km / 10 menit — driver periodik 12/24 jam.",
  "Gradien SSH (CMEMS Mercator): ~9 km, 1 titik efektif / 1 jam — korelasi tinggi dengan DS non-tidal (R≈0.80).",
  "Angin CS/DS (ERA5): ~28 km, 1 titik / 1 jam — pola diurnal CS (R~0.46).",
  "Batimetri (BATNAS): ~200 m, statis — penting terutama Lombok.",
  "SST Ostia: ~0.5 km, 1 titik / harian — relevan non-tidal CS di Sunda (R≈0.35).",
  "Lat/Lon + waktu cos/sin — konteks spasial & siklus diurnal/musiman.",
  "TIDAK dipakai: SSS (korelasi rendah), time-of-day mentah tanpa encoding (tidak menonjol), grid SSH/SST penuh bila single-point sudah memadai.",
]);

// —— U6 analysis ——
appendUnique(mod("u06"), "Distribusi variabel & korelasi linear", [
  "Gradien SSH: korelasi tertinggi dengan komponen DS (non-tidal).",
  "Tide: menggerakkan osilasi seasonal/diurnal 24 jam.",
  "Angin: menjelaskan pola 24 jam komponen CS.",
  "Batimetri berkorelasi dengan longitude → pengaruh kuat di Lombok (geometri kompleks).",
]);
appendUnique(mod("u06"), "SHAP: efek non-linear dan interaksi", [
  "SHAP (SHapley Additive exPlanations): kontribusi fitur per prediksi (teori permainan). Nilai +0.5 berarti fitur itu mendorong prediksi +0.5 unit relatif baseline.",
  "Temuan ringkas: Sunda DS — SSH gradient > tide > hour > day of year; Sunda CS — longitude > day_of_year_cos > latitude; Lombok — batimetri sangat berpengaruh (beda dari Sunda).",
]);
appendUnique(mod("u06"), "PSD, dekomposisi, dan lag correlation", [
  "Autokorelasi arus menunjukkan siklus ~24 jam (dan kelipatan) karena tide — alasan lookback ~24 jam.",
  "Autokorelasi signifikan bisa sampai ~14 hari, tetapi lookback lebih panjang = lebih sedikit sampel training.",
  "PSD: Sunda puncak dominan ~24 jam (diurnal K1/O1); Lombok ~12 jam (mixed semi-diurnal, M2). Cutoff dekomposisi ~72 jam (3×24 jam) menangkap seluruh pita tidal.",
  "Input tide praktis: t…t−24h resolusi 10 menit; t−24h…t−48h bisa di-downsample per jam.",
]);

// —— U7 preprocessing ——
appendUnique(mod("u07"), "Strategi mengisi gap kecil", [
  "Gap spatio-temporal (pixel hilang): interpolasi temporal jika gap ≤ 80 menit (Sunda) / ≤ 50 menit (Lombok); lalu ekstrapolasi spasial (Gauss–Seidel) bila tetangga valid; buang timestamp jika terlalu besar.",
  "Gap temporal (seluruh peta hilang): interpolasi temporal dengan ambang yang sama; di atas ambang biarkan kosong — itu tugas model ML.",
  "Ambang dipilih agar RMSE interpolasi tetap < ~10 cm/s. Lombok lebih ketat karena tide 12 jam + geometri Y (arus berubah lebih cepat).",
]);
appendUnique(mod("u07"), "Normalisasi dan splitting temporal", [
  "Z-score: y' = (y − μ) / σ. Lebih tahan outlier daripada Min–Max; cocok data mendekati normal dan optimasi berbasis gradien.",
  "HITUNG μ,σ HANYA dari training, lalu terapkan ke val/test — kalau tidak, terjadi leakage.",
  "Split: chunk temporal tersebar antar musim (train/val/test masing-masing melihat kondisi Australian / Asian / transisi) agar model terpapar semua rezim tanpa random shuffle.",
  "Buang ~48 jam pertama tiap chunk agar tidak ada kebocoran antar potongan bersebelahan.",
]);

// —— U8 baseline ——
appendUnique(mod("u08"), "Ide baseline: analogue / nearest neighbours", [
  "Cari K situasi historis mirip (tide, angin, SSH, arus masa lalu) di Milvus → rata-rata berbobot arus saat itu = prediksi.",
  "Hybrid Search multi-variabel + WeightedRanker; hanya data ≥24 jam ke belakang; tetangga harus berjarak >1 jam (diversitas).",
]);
appendUnique(mod("u08"), "Pembacaan hasil & limitasi (tanpa klaim DL)", [
  "Limitasi utama KNN: smoothing — ekstrem (arus sangat kuat/lemah) tergerus rata-rata tetangga. Jika semua tetangga kosong di wilayah spasial tertentu, output ikut kosong.",
  "Order-of-magnitude baseline Issue 3.0: Sunda RMSE ~30 cm/s; Lombok bisa lebih tinggi (hingga ~70 cm/s pada komponen V). DL harus mengalahkan baseline ini — angka final DL belum diklaim jika belum di Issue 3.0.",
]);

// —— U9 architectures ——
appendUnique(mod("u09"), "Dari literatur ke pilihan arsitektur", [
  "Perjalanan: Analogue (KNN) → LSTM (temporal) → ConvLSTM (spatio-temporal) → ConvLSTM + Attention (fokus timestep relevan).",
  "Literatur: ConvLSTM sering unggul vs CNN-GRU/LSTM untuk prediksi arus spatio-temporal; attention temporal dapat menurunkan MAE secara signifikan di studi referensi.",
]);
appendUnique(mod("u09"), "LSTM pada data UC1", [
  "Input LSTM tipikal: (batch, lookback, channels×H×W) setelah flatten spasial — hubungan tetangga hilang.",
  "Pipeline: flatten → LSTM → last hidden → Conv2D 1×1 decoder → (batch, lead_time, 2, H, W) untuk U & V.",
  "Cell state seperti “conveyor belt” memori jangka panjang (pola musiman); gate menangani update jangka pendek (siklus tide).",
]);
appendUnique(mod("u09"), "ConvLSTM: spasial + temporal", [
  "Gate LSTM diganti operasi konvolusi: f = σ(W_f ⊛ [h,x] + b) sehingga hidden tetap (batch, H, W, hidden).",
  "Pipeline: Input (B,T,C,H,W) → ConvLSTM → [opsional attention atas semua T] → Conv2D decoder → arus.",
]);
appendUnique(mod("u09"), "ConvLSTM + temporal attention", [
  "Tidak semua timestep masa lalu sama pentingnya. Attention menghitung bobot softmax atas keluaran ConvLSTM lalu weighted sum → context vector → prediksi.",
  "Intuisi UC1: saat prediksi t, keadaan ~12 jam lalu bisa lebih relevan daripada 5 menit lalu karena periodisitas tide.",
]);

// —— U10 training ——
appendUnique(mod("u10"), "One-pass: langsung ke lead time tetap", [
  "Input (t₀…t) → model → output t+LT. Sederhana, tapi sering butuh model terpisah per lead time; lemah di horizon panjang.",
]);
appendUnique(mod("u10"), "Iterative: langkah pendek diulang saat inferensi", [
  "Latih prediksi 1 langkah dengan ground truth; saat inferensi umpan prediksi kembali (roll sampai 24 jam). Fleksibel, tapi akumulasi error + mismatch train/infer.",
]);
appendUnique(mod("u10"), "Auto-regressive: latih dengan umpan prediksi", [
  "Saat training, model sengaja melihat prediksinya sendiri (scheduled sampling) agar robust terhadap input tidak sempurna. Lebih sulit dilatih, lebih baik untuk horizon panjang.",
]);
appendUnique(mod("u10"), "Residual learning: prediksi delta", [
  "Klasik: prediksi nilai arus absolut. Residual: prediksi Δ lalu tambahkan ke arus terakhir yang diketahui — error sering lebih kecil, sangat berguna di iterative/auto-regressive.",
]);

// —— U11 metrics ——
appendUnique(mod("u11"), "Eulerian: membandingkan di titik/waktu yang sama", [
  "RMSE = √(mean (ŷ−y)²) — penalti error besar; paling sering dilaporkan. MAE = mean |ŷ−y| — lebih tahan outlier.",
  "Bias = mean(y−ŷ): positif = underpredict. R² = 1 − SS_res/SS_tot; RSE = 1−R².",
]);
appendUnique(mod("u11"), "Metrik vektorial & akurasi berbasis ambang", [
  "Arah: DIR = (90 − atan2(u,v)·180/π) mod 360; RMSE arah harus memperhitungkan wrapping 0°=360°.",
  "Magnitude NORM = √(u²+v²). Threshold accuracy: apakah intensitas masuk rentang operasional yang sama (berguna untuk warning).",
]);
appendUnique(mod("u11"), "Lagrangian: partikel dan NCLS", [
  "NCLS = Σ dᵢ / Σ ℓ₀ᵢ (jarak separasi kumulatif / panjang lintasan observasi). Skill ≈ 1 − NCLS/n jika NCLS < n, else 0.",
  "Skill 1.0 = lintasan sempurna; 0.0 = error setara toleransi. Biasanya dihitung untuk drift 3h, 6h, 12h, 24h.",
  "Partikel dari setiap sel grid tiap 10 menit; integrasi Runge–Kutta orde-4 (Parcels). Pasangan yang keluar domain dibuang (batasan interpretasi).",
]);
upsertSection(mod("u11"), "Visualisasi diagnostik", [
  "Spasial: peta RMSE/bias per pixel, quiver field.",
  "Temporal: time series prediksi vs truth; error vs lead time.",
  "Statistik: scatter ŷ vs y; rotary spectra / PSD.",
  "Training: kurva loss train vs val; histogram skill Lagrangian.",
]);

// —— U12 pipeline / tooling ——
appendUnique(mod("u12"), "Factory Training AI UCs — September 2026", [
  "Alur pengembangan: literature → ekstraksi → analisis → preprocessing → metrik → baseline → model → iterasi → produksi.",
  "PyTorch Lightning: LightningModule (model+step), Trainer (loop/GPU/log), DataModule (load/split).",
  "MLflow: log param (lr, hidden, lookback), metric (RMSE), artifact model — bandingkan puluhan eksperimen dengan reproduksibel.",
  "Kedro: conf/ + nodes/ + pipelines (data_extraction → analysis → preprocessing → baseline → training → evaluation → docker).",
  "Produksi BMKG: Docker ekstraksi → Docker inferensi ML → Docker ekspor ke MANDALA. Cek: input lengkap, void terisi, forecast up-to-date, performa terkini dalam rentang.",
  "Output operasional target: U,V 10 menit, ~1 km, Sunda & Lombok — gap-fill + forecast 24 jam.",
]);

// —— Fundamentals enrich ——
appendUnique(mod("f01"), "Dua cara memprediksi fenomena laut", [
  "Tradisional: data + aturan/kode → output. ML: data + jawaban contoh → aturan terpelajar. UC1 memberi ribuan contoh (histori arus+tide+angin → arus aktual).",
]);
appendUnique(mod("f04"), "Loss = ukuran kesalahan", [
  "MSE = mean (prediksi − truth)² adalah loss regresi umum; RMSE adalah √MSE (satu satuan dengan arus).",
]);
appendUnique(mod("f04"), "Backprop & gradient descent (intuisi)", [
  "Forward: ŷ = activation(W·x + b). Backward: hitung kontribusi tiap bobot ke error (chain rule). Update: W ← W − lr · ∇W. Ulangi banyak epoch.",
]);
appendUnique(mod("f06"), "Tiga potongan data", [
  "Training (~65%): update bobot. Validation (~15%): pantau generalisasi & hyperparameter — tidak update bobot. Test (~20%): evaluasi akhir sekali.",
]);
appendUnique(mod("f06"), "Leakage & jenis split", [
  "JANGAN random split pada time series: masa depan bisa bocor ke train karena autokorelasi kuat (terutama tide). UC1 memakai chunk temporal antar musim.",
]);
appendUnique(mod("f08"), "LSTM dalam bahasa sehari-hari", [
  "Tiga gerbang: Forget (apa dibuang dari memori), Input (info baru disimpan), Output (apa dikeluarkan sekarang) + Cell State (memori jangka panjang).",
  "Shape input: (batch, lookback_time, features). Cocok untuk pola siklus 24 jam arus.",
]);
appendUnique(mod("f09"), "ConvLSTM & attention", [
  "LSTM flatten kehilangan tetangga spasial; ConvLSTM menjaga grid 2D di setiap gate.",
  "Attention temporal: bobot ke semua keluaran waktu → fokus ke momen paling relevan (mis. fase tide serupa).",
]);
appendUnique(mod("f10"), "Tooling FT (pengenalan)", [
  "Lightning mengurangi boilerplate training; MLflow menyimpan jejak eksperimen; Kedro merapikan pipeline data→model→eval; Docker untuk produksi multi-kontainer.",
]);

// —— Study guide quizzes (module + capstone explain) ——
const sgQuizzes = [
  {
    id: "sg01",
    modules: ["u02"],
    q: "Tujuan utama UC1 di MMS2 adalah…",
    options: [
      { value: "a", label: "Forecast curah hujan dari satelit" },
      {
        value: "b",
        label:
          "Mengisi gap temporal HF Radar + forecast arus hingga ~24 jam",
      },
      { value: "c", label: "Monitor banjir pesisir dari muka laut" },
      { value: "d", label: "Klasifikasi massa air dari profil suhu" },
    ],
    correct: "b",
    explain:
      "UC1 fokus void-filling arus permukaan HF Radar dan forecast hingga ~24 jam di Sunda & Lombok dengan metodologi ML yang sama.",
  },
  {
    id: "sg02",
    modules: ["u06", "f08"],
    q: "Autokorelasi arus HF Radar menunjukkan siklus ~24 jam terutama karena…",
    options: [
      { value: "a", label: "Siklus radiasi matahari harian pada SST" },
      { value: "b", label: "Siklus tekanan atmosfer 24 jam saja" },
      {
        value: "c",
        label: "Forcing tidal (komponen diurnal / semi-diurnal)",
      },
      { value: "d", label: "Jadwal monitoring peralatan radar" },
    ],
    correct: "c",
    explain:
      "Sunda cenderung diurnal (~24 jam); Lombok mixed semi-diurnal (~12 jam). Tide adalah input kritis dan alasan lookback ~24 jam.",
  },
  {
    id: "sg03",
    modules: ["u07", "f02"],
    q: "Kenapa Z-score lebih dipilih daripada Min–Max di preprocessing UC1?",
    options: [
      { value: "a", label: "Z-score selalu menghasilkan nilai 0–1" },
      {
        value: "b",
        label: "Lebih tahan outlier & cocok data mendekati normal",
      },
      { value: "c", label: "Min–Max butuh lebih banyak GPU" },
      { value: "d", label: "Z-score mempertahankan satuan fisik mentah" },
    ],
    correct: "b",
    explain:
      "Z-score memusatkan mean 0 dan variance 1; ekstrem tidak meremas seluruh skala seperti Min–Max. μ,σ hanya dari train.",
  },
  {
    id: "sg04",
    modules: ["u09", "f09"],
    q: "Perbedaan kunci LSTM vs ConvLSTM untuk prediksi arus adalah…",
    options: [
      { value: "a", label: "LSTM selalu lebih akurat daripada ConvLSTM" },
      {
        value: "b",
        label: "LSTM memakai gate; ConvLSTM hanya konvolusi tanpa memori",
      },
      {
        value: "c",
        label:
          "ConvLSTM mengganti matriks dense di gate dengan konvolusi sehingga struktur spasial terjaga",
      },
      {
        value: "d",
        label: "ConvLSTM hanya untuk time series 1D; LSTM untuk 2D",
      },
    ],
    correct: "c",
    explain:
      "Flatten di LSTM memutus hubungan tetangga. ConvLSTM menjaga dimensi H×W di hidden state — penting untuk field HF Radar.",
  },
  {
    id: "sg05",
    modules: ["u06", "u04"],
    q: "Variabel dengan korelasi tertinggi terhadap DS non-tidal di Lombok (analisis UC1) adalah…",
    options: [
      { value: "a", label: "SST" },
      { value: "b", label: "Kecepatan & arah angin" },
      {
        value: "c",
        label: "Gradien SSH Laut Jawa vs Samudra Hindia",
      },
      { value: "d", label: "SSS" },
    ],
    correct: "c",
    explain:
      "R≈0.80 setelah komponen tidal dihilangkan — selaras fisika ITF: gradien tekanan/SSH mendorong aliran melalui Lombok.",
  },
  {
    id: "sg06",
    modules: ["u07", "f06"],
    q: "Kenapa random train/val/test berbahaya untuk time series arus?",
    options: [
      { value: "a", label: "Random split terlalu mahal komputasi" },
      {
        value: "b",
        label:
          "Observasi masa depan bisa bocor ke train → metrik semu bagus",
      },
      { value: "c", label: "Resolusi temporal ikut berubah" },
      { value: "d", label: "Butuh lebih banyak langkah preprocessing" },
    ],
    correct: "b",
    explain:
      "Autokorelasi kuat (terutama tide) membuat random split = leakage. UC1 memakai chunk temporal antar musim.",
  },
  {
    id: "sg07",
    modules: ["u06"],
    q: "SHAP +0.5 untuk SSH_gradient pada prediksi DS berarti…",
    options: [
      { value: "a", label: "Korelasi SSH–DS = 0.5" },
      {
        value: "b",
        label:
          "Fitur itu mendorong prediksi DS naik ~0.5 unit relatif baseline untuk sampel tersebut",
      },
      { value: "c", label: "Feature importance global = 50%" },
      { value: "d", label: "Model selalu prediksi 0.5 m/s bila SSH ada" },
    ],
    correct: "b",
    explain:
      "SHAP adalah kontribusi lokal per sampel terhadap prediksi (additive), bukan korelasi global.",
  },
  {
    id: "sg08",
    modules: ["u08"],
    q: "Limitasi utama baseline Analogue/KNN dibanding DL adalah…",
    options: [
      { value: "a", label: "Milvus tidak bisa multi-variabel" },
      {
        value: "b",
        label:
          "Rata-rata tetangga menyamarkan ekstrem (smoothing arus kuat/lemah)",
      },
      { value: "c", label: "KNN wajib retrain tiap data baru" },
      { value: "d", label: "KNN tidak bisa pakai tide" },
    ],
    correct: "b",
    explain:
      "Prediksi = rata-rata berbobot → ekstrem tergerus; region yang kosong di semua tetangga ikut kosong di output.",
  },
  {
    id: "sg09",
    modules: ["u07"],
    q: "Kenapa ambang interpolasi Lombok (50 menit) lebih ketat dari Sunda (80 menit)?",
    options: [
      { value: "a", label: "Komputer Lombok lebih cepat" },
      { value: "b", label: "Lebih banyak stasiun radar" },
      {
        value: "c",
        label:
          "Arus Lombok berubah lebih cepat (tide 12 jam + geometri kompleks)",
      },
      { value: "d", label: "Resolusi spasial Lombok lebih tinggi" },
    ],
    correct: "c",
    explain:
      "Analisis RMSE interpolasi: error Lombok naik tajam setelah ~50 menit karena dinamika lebih cepat/kompleks.",
  },
  {
    id: "sg10",
    modules: ["u10"],
    q: "Beda Iterative vs Auto-regressive untuk forecast panjang…",
    options: [
      { value: "a", label: "Iterative = banyak model; AR = satu model" },
      {
        value: "b",
        label:
          "Iterative latih hanya dengan ground truth; AR melatih model menerima prediksinya sendiri",
      },
      { value: "c", label: "AR selalu lebih cepat dilatih" },
      { value: "d", label: "Iterative butuh lebih banyak VRAM" },
    ],
    correct: "b",
    explain:
      "Iterative: mismatch train/infer. Auto-regressive (+ residual) lebih robust ke akumulasi error di horizon panjang.",
  },
  {
    id: "sg11",
    modules: ["u11"],
    q: "NCLS Skill Score 0.85 untuk drift 6 jam berarti…",
    options: [
      { value: "a", label: "85% nilai arus dalam toleransi" },
      { value: "b", label: "Akurasi arah 85%" },
      {
        value: "c",
        label:
          "Error lintasan partikel ≈ 15% panjang lintasan observasi (dalam skema skill tersebut)",
      },
      { value: "d", label: "85% lintasan berhasil diprediksi" },
    ],
    correct: "c",
    explain:
      "Skill ≈ 1 − NCLS/n; 0.85 ≈ separasi kumulatif relatif kecil vs panjang lintasan — penting untuk SAR/oil spill.",
  },
  {
    id: "sg12",
    modules: ["u03", "u06"],
    q: "PSD Sunda puncak 24 jam & Lombok 12 jam sesuai rezim…",
    options: [
      { value: "a", label: "Sunda semi-diurnal; Lombok diurnal" },
      {
        value: "b",
        label: "Sunda diurnal (K1/O1); Lombok mixed semi-diurnal (M2)",
      },
      { value: "c", label: "Keduanya sama; beda hanya karena angin" },
      { value: "d", label: "Sunda spring–neap; Lombok semi-diurnal biasa" },
    ],
    correct: "b",
    explain:
      "Cutoff dekomposisi ~72 jam menangkap pita tidal penuh di kedua situs meski frekuensi dominan berbeda.",
  },
];

for (const q of sgQuizzes) {
  const item = {
    id: q.id,
    q: q.q,
    options: q.options,
    correct: q.correct,
    explain: q.explain,
  };
  for (const mid of q.modules) upsertQuiz(mod(mid), item);
  upsertCapstone({
    id: "cap_" + q.id,
    q: q.q,
    options: q.options,
    correct: q.correct,
    explain: q.explain,
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(c, null, 2) + "\n");
const nSec = c.modules.reduce((n, m) => n + m.sections.length, 0);
const nQuiz = c.modules.reduce((n, m) => n + m.quiz.length, 0);
console.log(
  "Enriched",
  jsonPath,
  "modules=",
  c.modules.length,
  "sections=",
  nSec,
  "moduleQuizzes=",
  nQuiz,
  "capstone=",
  c.capstone.length
);
