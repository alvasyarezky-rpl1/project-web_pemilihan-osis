-- Setup database untuk fitur Kelola Kandidat
-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat tabel candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  foto_url TEXT,
  visi TEXT NOT NULL,
  misi TEXT NOT NULL,
  program_kerja TEXT,
  tanggal_dibuat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_candidates_nama ON candidates(nama);
CREATE INDEX IF NOT EXISTS idx_candidates_tanggal_dibuat ON candidates(tanggal_dibuat);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- 4. Buat RLS policies
-- Policy untuk view - semua user bisa lihat kandidat
CREATE POLICY "Users can view all candidates" ON candidates
  FOR SELECT USING (true);

-- Policy untuk admin dan panitia - bisa CRUD kandidat
CREATE POLICY "Admin and Panitia can manage candidates" ON candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND peran IN ('admin', 'panitia')
    )
  );

-- 5. Insert sample data untuk testing
INSERT INTO candidates (nama, foto_url, visi, misi, program_kerja) VALUES 
('Ahmad Rizki', '', 'Mewujudkan OSIS yang inovatif dan berprestasi untuk kemajuan sekolah', '1. Meningkatkan kualitas kegiatan ekstrakurikuler\n2. Membangun komunikasi yang baik antar siswa\n3. Mengadakan program pengembangan diri\n4. Menciptakan lingkungan belajar yang kondusif', '1. Program "Siswa Berprestasi" - memberikan penghargaan dan dukungan untuk siswa berprestasi\n2. Program "Digital Learning" - memfasilitasi pembelajaran digital yang efektif\n3. Program "Green School" - menciptakan lingkungan sekolah yang ramah lingkungan\n4. Program "Student Exchange" - mengadakan pertukaran pelajar dengan sekolah lain\n5. Program "Entrepreneurship" - mengembangkan jiwa kewirausahaan siswa'),
('Siti Nurhaliza', '', 'OSIS yang solid dan berkarakter untuk membangun generasi unggul', '1. Memperkuat solidaritas antar siswa\n2. Mengadakan kegiatan keagamaan\n3. Meningkatkan prestasi akademik dan non-akademik\n4. Membangun karakter siswa yang berakhlak mulia', '1. Program "Religious Week" - mengadakan kegiatan keagamaan rutin\n2. Program "Character Building" - membangun karakter siswa melalui berbagai kegiatan\n3. Program "Academic Excellence" - mendukung prestasi akademik siswa\n4. Program "Community Service" - mengadakan bakti sosial ke masyarakat\n5. Program "Cultural Festival" - melestarikan dan mengembangkan budaya lokal'),
('Budi Santoso', '', 'OSIS yang kreatif dan mandiri untuk kemajuan bersama', '1. Mengembangkan bakat dan minat siswa\n2. Menciptakan lingkungan sekolah yang kondusif\n3. Membangun kerjasama dengan pihak luar\n4. Meningkatkan partisipasi siswa dalam kegiatan sekolah', '1. Program "Talent Show" - mengadakan kompetisi bakat siswa\n2. Program "Creative Workshop" - mengadakan workshop kreativitas\n3. Program "School Partnership" - membangun kerjasama dengan sekolah dan instansi lain\n4. Program "Student Council" - membentuk dewan siswa yang aktif\n5. Program "Innovation Lab" - menciptakan ruang untuk inovasi siswa');

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON candidates TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
