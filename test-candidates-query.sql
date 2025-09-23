-- Query untuk test data kandidat
-- Jalankan di Supabase SQL Editor

-- 1. Lihat semua kandidat
SELECT * FROM candidates ORDER BY tanggal_dibuat DESC;

-- 2. Hitung jumlah kandidat
SELECT COUNT(*) as total_kandidat FROM candidates;

-- 3. Lihat kandidat dengan nama tertentu
SELECT * FROM candidates WHERE nama ILIKE '%test%';

-- 4. Test insert kandidat baru
INSERT INTO candidates (nama, visi, misi, program_kerja) VALUES 
('Test Kandidat Manual', 'Visi test manual', 'Misi test manual', 'Program kerja test manual');

-- 5. Test update kandidat
UPDATE candidates 
SET nama = 'Test Kandidat Updated Manual' 
WHERE nama = 'Test Kandidat Manual';

-- 6. Test delete kandidat
DELETE FROM candidates 
WHERE nama = 'Test Kandidat Updated Manual';
