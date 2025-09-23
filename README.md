# Sistem Pemilihan Ketua OSIS

Website modern untuk pemilihan ketua OSIS dengan sistem role-based (Admin, Panitia, Member) yang dibangun menggunakan Next.js 15, TypeScript, Tailwind CSS, dan Supabase.

## 🚀 Fitur Utama

### Untuk Admin
- **Dashboard**: Statistik real-time pemilihan, aktivitas terbaru
- **Kelola Pengguna**: Tambah, edit, hapus pengguna dengan role berbeda
- **Kelola Kandidat**: Manajemen kandidat pemilihan
- **Pengaturan Pemilihan**: Atur jadwal dan status pemilihan
- **Hasil Pemilihan**: Visualisasi hasil dengan grafik interaktif

### Untuk Panitia
- **Dashboard**: Statistik dan aktivitas terbaru
- **Kelola Kandidat**: Manajemen kandidat pemilihan
- **Pengaturan Pemilihan**: Atur jadwal dan status pemilihan
- **Hasil Pemilihan**: Pantau hasil pemilihan real-time

### Untuk Member
- **Dashboard**: Status voting dan informasi pemilihan
- **Pilih Kandidat**: Interface voting yang user-friendly
- **Profil Kandidat**: Lihat visi dan misi kandidat

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Tabler Icons
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd sistempemilihan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Buat project baru di [Supabase](https://supabase.com)
   - Jalankan script SQL dari file `supabase-setup.sql` di SQL Editor
   - Dapatkan URL dan anon key dari Settings > API

4. **Setup Environment Variables**
   ```bash
   # Buat file .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

6. **Buka browser**
   ```
   http://localhost:3000
   ```

## 🗄️ Database Schema

### Tabel Users
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `role` (ENUM: admin, panitia, member)
- `created_at` (TIMESTAMP)

### Tabel Candidates
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `photo_url` (TEXT)
- `vision` (TEXT)
- `mission` (TEXT)
- `created_at` (TIMESTAMP)

### Tabel Elections
- `id` (UUID, Primary Key)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

### Tabel Votes
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `candidate_id` (UUID, Foreign Key)
- `voted_at` (TIMESTAMP)

## 🔐 Authentication & Authorization

Sistem menggunakan Supabase Auth dengan Row Level Security (RLS) untuk keamanan:

- **Admin**: Akses penuh ke semua fitur
- **Panitia**: Akses ke manajemen kandidat, pengaturan, dan hasil
- **Member**: Akses ke voting dan profil kandidat

## 📱 Responsive Design

Website fully responsive dan optimized untuk:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 UI Components

Menggunakan shadcn/ui components:
- Card, Button, Input, Label
- Select, Textarea, Badge
- Table, Tabs, Tooltip
- Sidebar, Sheet, Dialog

## 📊 Features Detail

### Dashboard
- Statistik real-time (kandidat, pemilih, suara)
- Progress bar pemilihan
- Aksi cepat berdasarkan role
- Aktivitas terbaru (admin/panitia)

### Voting System
- One-time voting (satu user = satu suara)
- Real-time validation
- Confirmation dialog
- Status tracking

### Results Visualization
- Bar chart dan pie chart
- Real-time updates
- Detailed statistics
- Export capabilities

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── ui/              # UI components
│   └── ...
├── contexts/            # React contexts
├── lib/                 # Utilities
└── hooks/               # Custom hooks
```

### Available Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push ke GitHub
2. Connect ke Vercel
3. Set environment variables
4. Deploy

### Manual Deployment
1. `npm run build`
2. Upload files ke server
3. Set environment variables
4. Run `npm start`

## 🔒 Security Features

- Row Level Security (RLS) di Supabase
- Role-based access control
- Input validation
- SQL injection protection
- XSS protection

## 📝 License

MIT License - lihat file LICENSE untuk detail.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan Next.js dan Supabase**