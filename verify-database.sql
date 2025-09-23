-- Script untuk verifikasi setup database
-- Jalankan di Supabase SQL Editor

-- 1. Cek apakah tabel candidates ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'candidates';

-- 2. Cek struktur tabel candidates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'candidates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Cek data kandidat
SELECT COUNT(*) as total_candidates FROM candidates;

-- 4. Cek RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'candidates';

-- 5. Test insert (jika berhasil, berarti RLS policy benar)
-- Hapus komentar di bawah untuk test
-- INSERT INTO candidates (nama, foto_url, visi, misi, program_kerja) 
-- VALUES ('Test Candidate', '', 'Test Vision', 'Test Mission', 'Test Program')
-- RETURNING *;
