# Deploy ke Vercel - Panduan Lengkap

## 📋 Prerequisites

1. **Database PostgreSQL** (pilih salah satu):

   - [Vercel Postgres](https://vercel.com/storage/postgres)
   - [Neon](https://neon.tech/) (Gratis)
   - [Supabase](https://supabase.com/) (Gratis)
   - [Railway](https://railway.app/)

2. **API Keys** yang diperlukan:
   - Google OAuth (untuk login)
   - Groq API Key (untuk AI medical report)
   - VAPI Public API Key (untuk voice consultation)

---

## 🚀 Langkah Deploy

### 1. Install Dependencies Lokal

```bash
# Hapus node_modules dan package-lock.json lama
rm -rf node_modules package-lock.json

# Install ulang dengan versi Prisma yang benar
npm install

# Generate Prisma Client
npx prisma generate
```

### 2. Setup Database

```bash
# Migrate database
npx prisma migrate deploy

# Atau kalau masih development
npx prisma migrate dev
```

### 3. Generate Encryption Key

```bash
# Generate encryption key yang aman (32+ karakter)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**PENTING:** Simpan key ini dengan aman! Jika hilang, data tidak bisa di-decrypt!

### 4. Push ke GitHub

```bash
git add .
git commit -m "Setup encryption and prepare for deploy"
git push origin main
```

### 5. Deploy ke Vercel

#### A. Import Project

1. Buka [vercel.com](https://vercel.com)
2. Klik **New Project**
3. Import repository GitHub Anda
4. Pilih framework: **Next.js**

#### B. Configure Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret

# Groq AI
GROQ_API_KEY=your-groq-api-key

# VAPI AI
NEXT_PUBLIC_VAPI_PUBLIC_API_KEY=your-vapi-public-api-key

# ENCRYPTION KEY (WAJIB!)
ENCRYPTION_KEY=hasil-dari-generate-command-di-atas
```

#### C. Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

#### D. Deploy!

Klik **Deploy** dan tunggu proses selesai.

---

## 🔧 Troubleshooting

### Error: "Prisma Client not generated"

```bash
# Di local
npx prisma generate

# Di Vercel, pastikan ada script di package.json:
"postinstall": "prisma generate"
```

### Error: "ENCRYPTION_KEY is not defined"

1. Pastikan `ENCRYPTION_KEY` sudah di-set di Vercel Environment Variables
2. Minimal 32 karakter
3. Generate ulang: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Error: Database Connection

1. Pastikan `DATABASE_URL` benar
2. Format: `postgresql://user:password@host:5432/database`
3. Test koneksi: `npx prisma db pull`

### Error: Build Failed

```bash
# Test build di lokal dulu
npm run build

# Cek error dan fix
npm run dev
```

---

## ✅ Checklist Sebelum Deploy

- [ ] Install dependencies: `npm install`
- [ ] Generate Prisma: `npx prisma generate`
- [ ] Test build lokal: `npm run build`
- [ ] Test dev lokal: `npm run dev`
- [ ] Database sudah dibuat
- [ ] Semua environment variables sudah siap
- [ ] Generate ENCRYPTION_KEY yang aman
- [ ] Push ke GitHub
- [ ] Set environment variables di Vercel
- [ ] Deploy!

---

## 🔐 Keamanan

### JANGAN commit file berikut ke Git:

- `.env` (sudah di `.gitignore`)
- `.env.local`
- `ENCRYPTION_KEY` di code

### DO commit:

- `.env.example` (template tanpa nilai sebenarnya)
- Dokumentasi

---

## 📞 Support

Jika ada masalah:

1. Cek Vercel deployment logs
2. Cek browser console untuk error frontend
3. Test API routes di Postman/Thunder Client
4. Cek database connection

---

## 🎯 Post-Deploy

Setelah deploy berhasil:

1. Test login dengan Google OAuth
2. Test buat consultation baru
3. Test voice call dengan VAPI
4. Test generate report
5. Verify data terenkripsi di database
6. Setup custom domain (optional)

---

## 🔄 Update Setelah Deploy

```bash
# 1. Buat perubahan
git add .
git commit -m "Your changes"
git push origin main

# 2. Vercel akan auto-deploy
# 3. Cek deployment di Vercel dashboard
```

---

**Good luck! 🚀**
