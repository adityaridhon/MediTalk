# Pre-Deploy Checklist

## ✅ Files yang Sudah Diupdate

### 1. Core Files

- [x] `package.json` - Downgrade Prisma ke v6.8.0
- [x] `prisma/schema.prisma` - Fix datasource untuk Prisma v6
- [x] `lib/prisma.ts` - Fix import path dari @prisma/client
- [x] `lib/encryption.ts` - Fungsi encrypt/decrypt dengan Native Crypto
- [x] `hooks/useVapi.ts` - Fix timestamp format ke ISO

### 2. Environment & Config

- [x] `.env.example` - Template environment variables
- [x] `vercel.json` - Konfigurasi build Vercel
- [x] `DEPLOY.md` - Panduan deploy lengkap

### 3. API Routes dengan Enkripsi

- [ ] `app/api/consultation/route.ts` - GET & POST (perlu update decrypt)
- [ ] `app/api/consultation/[id]/route.ts` - GET, PATCH, DELETE (perlu update decrypt)
- [ ] `app/api/consultation/save/route.ts` - POST (perlu update encrypt)
- [ ] `app/api/consultation/generate-report/route.ts` - POST (sudah update)

### 4. UI Components

- [x] `components/ui/MedicalAgentChat.tsx` - Fix formatTimestamp

---

## 🔧 Yang Perlu Dilakukan Sekarang

### 1. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Simpan hasilnya untuk dipakai di .env dan Vercel!**

### 2. Update .env Lokal

Tambahkan ke file `.env`:

```env
ENCRYPTION_KEY=hasil-dari-generate-di-atas
```

### 3. Reset Database (HAPUS SEMUA DATA LAMA!)

```bash
npx prisma migrate reset
# atau
npx prisma migrate dev --name add-encryption-fields
```

### 4. Update API Routes

Jalankan command ini untuk mengupdate semua API routes sekaligus dengan enkripsi.

### 5. Test Lokal

```bash
npm run dev
```

- [ ] Test login
- [ ] Test buat consultation
- [ ] Test voice chat
- [ ] Test generate report
- [ ] Cek database (conversation & report harus encrypted)

### 6. Siapkan untuk Deploy

- [ ] Setup PostgreSQL database (Neon/Vercel Postgres/Supabase)
- [ ] Dapatkan Google OAuth credentials
- [ ] Dapatkan Groq API key
- [ ] Dapatkan VAPI public key

### 7. Deploy ke Vercel

- [ ] Push ke GitHub
- [ ] Import project di Vercel
- [ ] Set environment variables
- [ ] Deploy!

---

## ⚠️ PENTING!

**ENCRYPTION_KEY:**

- HARUS minimal 32 karakter
- JANGAN lupa save key ini dengan aman!
- Kalau key hilang, data TIDAK BISA di-decrypt!
- Gunakan key yang SAMA di lokal dan production

**Database:**

- Sebelum deploy, RESET database lokal
- Data lama (tanpa enkripsi) TIDAK KOMPATIBEL
- Production database harus fresh dengan schema baru

**Environment Variables:**
Semua variable di `.env.example` WAJIB di-set di Vercel:

- DATABASE_URL
- AUTH_SECRET
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- GROQ_API_KEY
- NEXT_PUBLIC_VAPI_PUBLIC_API_KEY
- ENCRYPTION_KEY

---

## 📝 Next Steps

1. ✅ Generate encryption key
2. ⏳ Update semua API routes dengan enkripsi
3. ⏳ Reset database
4. ⏳ Test semua fitur lokal
5. ⏳ Deploy ke Vercel

Ikuti panduan lengkap di `DEPLOY.md`
