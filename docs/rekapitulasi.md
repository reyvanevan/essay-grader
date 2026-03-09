# 📂 Project Documentation: AI Automated Essay Grading System

**Date:** 16 December 2025
**Status:** ✅ MVP Backend Logic Completed (Production Ready for Testing)
**Tech Stack:** n8n (Workflow Automation), Supabase (Database), Llama 3.3-70b (via OpenAI Compatible Endpoint).

---

## 1. Tujuan Utama (Objective)
Membangun sistem backend otomatis yang dapat:
1.  Menerima input jawaban esai mahasiswa via Webhook.
2.  Menilai jawaban tersebut menggunakan AI (membandingkan dengan kunci jawaban).
3.  Menghasilkan output terstruktur: Score (0-100), Feedback, dan Reasoning.
4.  Menyimpan hasil penilaian ke database (tabel `grades`).
5.  Mengupdate status tugas mahasiswa (tabel `submissions`) agar tidak dinilai ganda.

---

## 2. Struktur Database (Supabase)
Sistem ini menggunakan **3 tabel utama** yang saling berelasi:

### A. Tabel `assignments` (Bank Soal)
* **Fungsi:** Menyimpan master soal dan kunci jawaban.
* **Kolom Penting:** `id`, `title`, `question_text`, `correct_answer_key`.

### B. Tabel `submissions` (Jawaban Masuk)
* **Fungsi:** Menampung jawaban yang dikirim mahasiswa.
* **Kolom Penting:**
    * `id` (UUID): Primary Key.
    * `assignment_id`: Foreign Key ke tabel assignments.
    * `student_name`: Nama mahasiswa.
    * `answer_text`: Jawaban esai.
    * `status`: Default `'pending'`, berubah jadi `'graded'` setelah diproses n8n.

### C. Tabel `grades` (Hasil Penilaian)
* **Fungsi:** Menyimpan hasil grading dari AI (terpisah dari submission).
* **Kolom Penting:**
    * `submission_id`: Foreign Key ke tabel submissions.
    * `ai_score` (Integer): Nilai kuantitatif.
    * `ai_feedback` (Text): Umpan balik kualitatif.
    * `ai_reasoning` (Text): Alasan penilaian.
    * `is_plagiarism` (Boolean): Default `false` (siap untuk fitur masa depan).

---

## 3. Workflow Logic (n8n)
Berikut adalah alur data (pipeline) yang sudah dikonfigurasi dalam `ai-grader.json`:

1.  **Webhook (POST):**
    * Menerima payload berisi `submission_id`, `question_text`, `correct_answer`, `student_answer`.

2.  **AI Agent (Llama 3.3):**
    * Role: Dosen Senior.
    * Task: Membandingkan jawaban mahasiswa vs kunci jawaban.
    * Output: JSON String `{ "score": ..., "feedback": ..., "reasoning": ... }`.

3.  **Code (JavaScript):**
    * Parsing output JSON dari AI.
    * Menggabungkan hasil parse dengan `submission_id` dari Webhook awal.
    * *Snippet Logic:*
        const aiResponse = items[0].json.output || items[0].json.text;
        const data = JSON.parse(aiResponse);
        return [{
            json: {
                ai_score: data.score,
                ai_feedback: data.feedback,
                ai_reasoning: data.reasoning,
                submission_id: $('Webhook').first().json.body.submission_id
            }
        }];

4.  **Supabase: Create a row (Insert `grades`):**
    * Action: Insert data hasil grading ke tabel `grades`.

5.  **Supabase: Update a row (Update `submissions`):**
    * Action: Update status menjadi `'graded'`.
    * Logic Key: Match row dimana `id` (table) Equal `submission_id` (n8n).

---

## 4. Pencapaian Terakhir (Current Milestones)
* ✅ **Workflow Valid:** JSON workflow berjalan tanpa error sintaks.
* ✅ **Database Connected:** n8n sukses membaca dan menulis ke Supabase.
* ✅ **Logic Update Fix:** Node update status sudah diperbaiki menggunakan kondisi `id (equal) submission_id`.
* ✅ **Test Run:** Percobaan dengan data dummy berhasil menghasilkan status `graded` dan nilai masuk database.

---

## 5. Rencana Selanjutnya (Next Steps)
Lakukan langkah ini secara berurutan:

1.  **Integration Testing (Real Data):**
    * Input data valid di tabel `submissions` (dengan `assignment_id` yang nyata).
    * Trigger workflow n8n.
    * Verifikasi hasil akhir di tabel `grades`.

2.  **Frontend Integration:**
    * Hubungkan form submit di website mahasiswa ke URL Webhook n8n.

3.  **Future Dev:**
    * Implementasi Plagiarism Checker (Update kolom `is_plagiarism`).
