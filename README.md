# ✴ Prompt Craftsman

> **Craft raw thoughts into production-grade Master Prompts using Claude's 6-Layer Prompt Anatomy.**

**Prompt Craftsman** adalah aplikasi web berbasis AI yang dirancang untuk memproses ide prompt singkat dari pengguna dan meraciknya menjadi sebuah **Master Prompt** berstandar industri. Aplikasi ini mengimplementasikan metodologi **6 Lapisan Anatomi Prompt Claude** untuk memastikan instruksi yang diberikan kepada Large Language Model (LLM) memiliki konteks yang jelas, arahan yang presisi, dan hasil akhir yang dapat ditindaklanjuti (*actionable*).

---

## 🏛️ Anatomi 6 Lapisan Prompt Claude

Prompt yang berkualitas tinggi dibangun di atas fondasi yang terstruktur, bukan sekadar kalimat instruksi lepas. Prompt Craftsman membedah dan menyusun setiap permintaan ke dalam 6 dimensi:

```
┌────────────────────────────────────────────────────────┐
│  1. ROLE            - Siapa AI ini & orientasinya      │
├────────────────────────────────────────────────────────┤
│  2. TASK            - Apa deliverable utama pekerjaannya│
├────────────────────────────────────────────────────────┤
│  3. CONTEXT         - Latar belakang, data & batasan   │
├────────────────────────────────────────────────────────┤
│  4. REASONING       - Alasan strategis di balik tugas  │
├────────────────────────────────────────────────────────┤
│  5. STOP CONDITIONS - Kriteria terukur kapan pekerjaan │
│                       dianggap selesai                 │
├────────────────────────────────────────────────────────┤
│  6. OUTPUT          - Format dan struktur penyajian    │
└────────────────────────────────────────────────────────┘
```

### 1. 🔵 Role (Peran & Identitas)
- **Tujuan:** Menentukan kepribadian profesional, tingkat keahlian (*seniority*), dan sudut pandang AI saat menjawab.
- **Isi Kunci:** Bidang keahlian mendalam, pengalaman spesifik, serta prioritas utama (misalnya: *kecepatan eksekusi di atas kesempurnaan merek*).
- **Contoh:**
  > *"Act as a senior go-to-market strategist with deep expertise launching early-stage SaaS tools. Prioritize traction speed over brand perfection."*

### 2. 🟠 Task (Tugas Utama)
- **Tujuan:** Menjelaskan secara tegas pekerjaan spesifik yang harus diselesaikan tanpa ambiguitas.
- **Isi Kunci:** Deliverable inti, target jangka waktu, dan hasil akhir yang diharapkan.
- **Contoh:**
  > *"Build a 90-day launch plan for a new AI productivity tool for founders. Validate the core messaging, end with a launch-ready brief."*

### 3. 🟢 Context (Konteks & Batasan)
- **Tujuan:** Memberikan seluruh informasi dasar yang sudah diketahui agar AI tidak berhalusinasi atau membuat asumsi yang keliru.
- **Isi Kunci:** Detail produk, profil target audiens, komposisi tim, keterbatasan anggaran/sumber daya, dan risiko utama.
- **Contoh:**
  > *"- Product: AI task manager for founders (25-40).*\
  > *- Team: 2-person (Founder + Growth marketer).*\
  > *- Resources: Lean budget, 15-20 beta users.*"

### 4. 🔴 Reasoning (Alasan Strategis)
- **Tujuan:** Menjelaskan *mengapa* tugas ini dilakukan dan standar kualitas apa yang menjadi tolak ukur keberhasilan.
- **Isi Kunci:** Justifikasi strategi dan pembelaan logis di balik setiap langkah solusi yang disarankan.
- **Contoh:**
  > *"The goal is a crisp, launch-ready strategy. By locking in ICP clarity upfront and asking you to defend each step, the output will be truly actionable and founder-grade."*

### 5. 🌸 Stop Conditions (Kondisi Selesai)
- **Tujuan:** Menetapkan batasan tegas kapan AI harus menghentikan responsnya agar jawaban tidak bertele-tele atau keluar jalur.
- **Isi Kunci:** Indikator penyelesaian terukur (*measurable checklist*).
- **Contoh:**
  > *"Only stop when:*\
  > *- A 12-week roadmap with 3-4 actions/week is generated.*\
  > *- Every action links to the risk it addresses.*\
  > *- Plan ends with a final Launch Decision Gate."*

### 6. 🟣 Output (Format Penyajian)
- **Tujuan:** Mendikte struktur akhir penyajian data agar langsung siap pakai atau mudah dipindahkan ke dokumen kerja.
- **Isi Kunci:** Pilihan format (tabel, sprint plan mingguan, bullet poin), penanggung jawab (*owner*), risiko, dan deliverable.
- **Contoh:**
  > *"Present as a weekly sprint plan. For each action: Action, Owner, Risk, Rationale + Output."*

---

## ⚡ Fitur Utama Aplikasi

- **💡 Instant Idea to Anatomy:** Masukkan ide sederhana dalam 1 kalimat, AI akan meramunya menjadi 6 lapisan lengkap.
- **✏️ Editable Interactive Canvas:** Setiap lapisan dapat disesuaikan dan disunting langsung tanpa kehilangan fokus kursor.
- **📋 One-Click Copy Master Prompt:** Menggabungkan seluruh lapisan menjadi satu Master Prompt siap pakai dengan format markdown bersih.
- **🛡️ Secure API Architecture:** Menggunakan proxy Vite lokal di sisi server (Node.js) sehingga API key tidak pernah dibocorkan ke bundle browser pengguna.
- **🔄 Resilient Model Fallback:** Otomatis beralih ke model Gemini alternatif jika salah satu model mengalami antrean atau lonjakan trafik.
- **💾 Auto-Save Local Storage:** Data input tersimpan aman secara otomatis di browser menggunakan custom React hook.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine:** Google Gemini API (`gemini-3.5-flash-lite` dengan automatic fallback)
- **Architecture:** Custom Middleware Proxy, Custom React Hooks (`usePersistentState`, `usePromptGenerator`), Error Boundary

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Clone Repository
```bash
git clone https://github.com/Gofuramanu/prompt-Craftsman.git
cd prompt-Craftsman
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan API Key Gemini Anda:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```
> Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/apikey).

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.
