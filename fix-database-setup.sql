-- Fix database setup untuk Sistem Pemilihan Ketua OSIS
-- Jalankan script ini di Supabase SQL Editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin and Panitia can manage candidates" ON candidates;

-- 2. Fix RLS policy untuk candidates
CREATE POLICY "Admin and Panitia can manage candidates" ON candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'panitia')
    )
  );

-- 3. Insert sample data jika belum ada
INSERT INTO candidates (nama, foto_url, visi, misi, program_kerja) VALUES 
('Ahmad Rizki', '', 'Mewujudkan OSIS yang inovatif dan berprestasi untuk kemajuan sekolah', '1. Meningkatkan kualitas kegiatan ekstrakurikuler\n2. Membangun komunikasi yang baik antar siswa\n3. Mengadakan program pengembangan diri\n4. Menciptakan lingkungan belajar yang kondusif', '1. Program "Siswa Berprestasi" - memberikan penghargaan dan dukungan untuk siswa berprestasi\n2. Program "Digital Learning" - memfasilitasi pembelajaran digital yang efektif\n3. Program "Green School" - menciptakan lingkungan sekolah yang ramah lingkungan\n4. Program "Student Exchange" - mengadakan pertukaran pelajar dengan sekolah lain\n5. Program "Entrepreneurship" - mengembangkan jiwa kewirausahaan siswa')
ON CONFLICT DO NOTHING;

INSERT INTO candidates (nama, foto_url, visi, misi, program_kerja) VALUES 
('Siti Nurhaliza', '', 'OSIS yang solid dan berkarakter untuk membangun generasi unggul', '1. Memperkuat solidaritas antar siswa\n2. Mengadakan kegiatan keagamaan\n3. Meningkatkan prestasi akademik dan non-akademik\n4. Membangun karakter siswa yang berakhlak mulia', '1. Program "Religious Week" - mengadakan kegiatan keagamaan rutin\n2. Program "Character Building" - membangun karakter siswa melalui berbagai kegiatan\n3. Program "Academic Excellence" - mendukung prestasi akademik siswa\n4. Program "Community Service" - mengadakan bakti sosial ke masyarakat\n5. Program "Cultural Festival" - melestarikan dan mengembangkan budaya lokal')
ON CONFLICT DO NOTHING;

INSERT INTO candidates (nama, foto_url, visi, misi, program_kerja) VALUES 
('Budi Santoso', '', 'OSIS yang kreatif dan mandiri untuk kemajuan bersama', '1. Mengembangkan bakat dan minat siswa\n2. Menciptakan lingkungan sekolah yang kondusif\n3. Membangun kerjasama dengan pihak luar\n4. Meningkatkan partisipasi siswa dalam kegiatan sekolah', '1. Program "Talent Show" - mengadakan kompetisi bakat siswa\n2. Program "Creative Workshop" - mengadakan workshop kreativitas\n3. Program "School Partnership" - membangun kerjasama dengan sekolah dan instansi lain\n4. Program "Student Council" - membentuk dewan siswa yang aktif\n5. Program "Innovation Lab" - menciptakan ruang untuk inovasi siswa')
ON CONFLICT DO NOTHING;
