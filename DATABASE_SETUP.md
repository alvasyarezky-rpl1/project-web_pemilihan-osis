# Setup Database Supabase

## 1. Buat Project Supabase

1. Buka [Supabase](https://supabase.com)
2. Login atau daftar akun
3. Klik "New Project"
4. Pilih organization
5. Isi nama project: "Sistem Pemilihan OSIS"
6. Buat password database yang kuat
7. Pilih region terdekat (Singapore untuk Indonesia)
8. Klik "Create new project"

## 2. Setup Database Schema

1. Buka project yang baru dibuat
2. Pergi ke **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy dan paste seluruh isi file `supabase-setup.sql`
5. Klik **Run** untuk menjalankan script

## 3. Setup Authentication

1. Pergi ke **Authentication** > **Settings**
2. Scroll ke **Site URL**
3. Set URL ke: `http://localhost:3000` (untuk development)
4. Scroll ke **Email Auth**
5. Pastikan **Enable email confirmations** di-disable untuk development
6. Scroll ke **Auth Providers**
7. Pastikan **Email** provider aktif

## 4. Buat User Pertama (Admin)

1. Pergi ke **Authentication** > **Users**
2. Klik **Add user**
3. Isi email: `admin@osis.com`
4. Isi password yang kuat
5. Klik **Create user**
6. Copy **User ID** yang dihasilkan

1. Pergi ke **SQL Editor**
2. Jalankan query berikut (ganti USER_ID dengan ID yang dicopy):

```sql
-- Update user role menjadi admin
UPDATE users 
SET role = 'admin' 
WHERE id = 'USER_ID_YANG_DICOPY';
```

## 5. Setup Environment Variables

1. Buat file `.env.local` di root project
2. Copy isi dari `.env.example`
3. Dapatkan nilai dari Supabase:

### Mendapatkan Supabase URL dan Key:
1. Pergi ke **Settings** > **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Contoh .env.local:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6. Test Database Connection

1. Jalankan development server:
   ```bash
   npm run dev
   ```

2. Buka `http://localhost:3000`
3. Klik "Masuk Sekarang"
4. Login dengan email dan password admin yang dibuat
5. Jika berhasil, Anda akan diarahkan ke dashboard

## 7. Insert Data Sample (Opsional)

Untuk testing, Anda bisa insert data sample:

### Insert Sample Candidates:
```sql
INSERT INTO candidates (name, photo_url, vision, mission) VALUES 
('Ahmad Rizki', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
 'Mewujudkan OSIS yang inovatif dan berprestasi', 
 '1. Meningkatkan kualitas kegiatan ekstrakurikuler\n2. Membangun komunikasi yang baik antar siswa\n3. Mengadakan program pengembangan diri'),
 
('Siti Nurhaliza', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 
 'OSIS yang solid dan berkarakter', 
 '1. Memperkuat solidaritas antar siswa\n2. Mengadakan kegiatan keagamaan\n3. Meningkatkan prestasi akademik dan non-akademik'),
 
('Budi Santoso', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
 'OSIS yang kreatif dan mandiri', 
 '1. Mengembangkan bakat dan minat siswa\n2. Menciptakan lingkungan sekolah yang kondusif\n3. Membangun kerjasama dengan pihak luar');
```

### Insert Sample Election:
```sql
INSERT INTO elections (start_date, end_date, is_active) VALUES 
(NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', true);
```

### Insert Sample Member Users:
```sql
INSERT INTO users (name, email, role) VALUES 
('Siswa 1', 'siswa1@osis.com', 'member'),
('Siswa 2', 'siswa2@osis.com', 'member'),
('Siswa 3', 'siswa3@osis.com', 'member');
```

## 8. Troubleshooting

### Error: "Invalid API key"
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
- Pastikan tidak ada spasi atau karakter tambahan

### Error: "Invalid URL"
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` benar
- Pastikan URL tidak berakhir dengan `/`

### Error: "User not found"
- Pastikan user sudah dibuat di Authentication
- Pastikan user sudah di-insert ke tabel `users` dengan role yang benar

### Error: "Permission denied"
- Pastikan RLS policies sudah dijalankan
- Pastikan user memiliki role yang sesuai

## 9. Production Setup

Untuk production:

1. **Update Site URL** di Supabase:
   - Authentication > Settings > Site URL
   - Set ke domain production Anda

2. **Enable Email Confirmations**:
   - Authentication > Settings > Email Auth
   - Enable "Confirm email" untuk keamanan

3. **Setup Custom SMTP** (opsional):
   - Authentication > Settings > SMTP Settings
   - Konfigurasi email server Anda

4. **Setup Domain**:
   - Authentication > Settings > Site URL
   - Tambahkan domain production

## 10. Monitoring

Gunakan dashboard Supabase untuk monitoring:
- **Database**: Lihat query performance
- **Authentication**: Monitor user activity
- **Logs**: Debug issues
- **API**: Monitor API usage
