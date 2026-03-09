# Analisa Kebutuhan UI & Database Berdasarkan BAB 1 & BAB 2

Dokumen ini berisi rangkuman perubahan yang diperlukan pada proses bisnis (UI) dan struktur Database (Supabase) agar aplikasi **Essay Grader** selaras dengan isi Proposal Tugas Akhir (Bab 1 dan Bab 2).

---

## 1. Integrasi OCR (Tulis Tangan)
Pada Bab 1 (Batasan Masalah poin 3) dan Bab 2 (poin 2.4) disebutkan sistem dapat:
*"Menerima data berupa teks digital dan citra jawaban tulis tangan yang terbaca jelas untuk diproses menggunakan mesin OCR."*

**Dampak ke Sistem:**
- **UI `/submissions` (Form Mahasiswa):** Harus ada fitur/tombol **Upload Gambar** (menerima file foto kertas jawaban) selain *text-area* untuk jawaban teks digital.
- **Database (`submissions`):** Perlu menambahkan kolom `answer_image_url` (Text) untuk menyimpan link/foto jawaban mahasiswa ke dalam tabel `submissions`.
- **Backend (n8n):** Workflow harus diperbarui agar mengekstrak teks dari gambar (proses OCR) terlebih dahulu sebelum memasukkannya ke prompt LLM.

---

## 2. Orkestrasi Rubrik Dosen (Middleware)
Pada Bab 1 (Tujuan Penelitian poin 1), sistem ini berfungsi untuk:
*"Mengorkestrasi instruksi dosen, rubrik penilaian, dan jawaban mahasiswa..."*

Hal ini menjadi pembeda utama aplikasi ini dari sistem berbasis *keyword matching* biasa maupun *direct-prompting* LLM generik.

**Dampak ke Sistem:**
- **UI Create Assignment (Form Dosen):** Saat membuat tugas baru, harus memberikan inputan **"Rubrik Penilaian"** atau "Instruksi Penilaian Khusus" (selain Kunci Jawaban).
- **Database (`assignments`):** Perlu menambahkan kolom `rubric_text` atau `grading_instructions` (Text) agar AI memahami aturan penilaian yang spesifik dari masing-masing dosen.

---

## 3. Validasi & Pengujian Statistik (MAE, Confusion Matrix)
Bab 2 (poin 2.5) memaparkan rencana validasi perhitungan nilai AI menggunakan *Mean Absolute Error (MAE)* dan *Confusion Matrix*, yang membandingkan performa sistem dengan penilai manusia (Dosen).

**Dampak ke Sistem:**
- **UI `/submissions/$id` (Dashboard Evaluasi Dosen):** Pada halaman detail untuk memeriksa hasil grading, harus ada inputan **"Nilai Manual Dosen"** yang disandingkan dengan **"Skor AI"**. Dosen dapat menginput skor versi manual mereka setelah mengevaluasi alasan (reasoning) dari AI.
- **Database (`grades`):** Perlu menambahkan kolom `manual_score` (Integer) ke tabel. Data dari kolom `ai_score` dan `manual_score` ini nantinya akan di-export menjadi dataset untuk menghitung MAE dan Korelasi Statistik pada penyusunan **Bab 4 (Hasil Analisis)** penelitian.
