# 🩺 MediTalk — AI Medical Voice Agent

**MediTalk** adalah website yang memunginkan pengguna untuk berkonsultai dengan agen AI tentang gejala medis yang dialami dengan komunikasi real-time berbasis suara.  
Dibangun dengan **Next.js 15**, **Auth.js**, **Prisma**, and **ShadCN UI**.

---

## 🚀 Fitur Utama (Rencana)

| Versi  | Deskripsi                                    |
| ------ | -------------------------------------------- |
| v0.1.0 | Setup project, Auth (Google), Front-End base |
| v0.2.0 | Konsultasi dengan Agen AI (MVP)              |
| v0.3.0 | Multilingual support (EN/ID)                 |
| v0.4.0 | Subscription system untuk agen bahasa lain   |
| v1.0.0 | Rilis dan optimasi sistem                    |

---

## 🧩 Tech Stack

- **Frontend**: Next.js 15, TailwindCSS, ShadCN UI
- **Backend**: Next.js Route Handlers + Prisma (PostgreSQL via Neon)
- **Auth**: NextAuth (Auth.js) with Google Provider
- **Voice Engine**: VAPI AI dengan model suara dari 11labs
- **Payment**: Stripe/Clerk/etc
- **i18n/multilingual**: next-intl

---

## ⚙️ Langkah instalasi

```bash
git clone https://github.com/adityaridhon/meditalk.git
cd meditalk
npm install
cp .env.example .env.local
npm run dev
```
