-- Setup database untuk Sistem Pemilihan Ketua OSIS
-- Jalankan script ini di Supabase SQL Editor

-- 1. Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'panitia', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  vision TEXT NOT NULL,
  mission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat tabel elections
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Buat tabel events (acara pemilihan)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Buat tabel votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- Satu user hanya bisa vote sekali per acara
);

-- 6. Buat tabel notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('event_created', 'event_approved', 'event_rejected', 'event_started', 'event_completed', 'vote_reminder')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Buat indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_event_id ON votes(event_id);
CREATE INDEX IF NOT EXISTS idx_elections_active ON elections(is_active);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_approved_by ON events(approved_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 8. Buat RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy untuk users - semua user bisa lihat data user lain
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Policy untuk candidates - semua user bisa lihat kandidat
CREATE POLICY "Users can view all candidates" ON candidates
  FOR SELECT USING (true);

-- Policy untuk elections - semua user bisa lihat pemilihan
CREATE POLICY "Users can view all elections" ON elections
  FOR SELECT USING (true);

-- Policy untuk votes - user hanya bisa lihat vote mereka sendiri
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy untuk admin - bisa CRUD semua data
CREATE POLICY "Admin can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage candidates" ON candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', '')
    )
  );

CREATE POLICY "Admin can manage elections" ON elections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'panitia')
    )
  );

-- Policy untuk voting - member bisa insert vote
CREATE POLICY "Members can vote" ON votes
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'member'
    )
  );

-- Policy untuk events
CREATE POLICY "Users can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Panitia can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('panitia', 'admin')
    )
  );

CREATE POLICY "Admin can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Policy untuk notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 7. Buat function untuk mendapatkan user data
CREATE OR REPLACE FUNCTION get_user_data()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.role, u.created_at
  FROM users u
  WHERE u.id::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Buat function untuk mendapatkan hasil voting
CREATE OR REPLACE FUNCTION get_voting_results()
RETURNS TABLE (
  candidate_id UUID,
  candidate_name VARCHAR(255),
  votes_count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_votes BIGINT;
BEGIN
  -- Hitung total votes
  SELECT COUNT(*) INTO total_votes FROM votes;
  
  -- Return hasil voting
  RETURN QUERY
  SELECT 
    c.id as candidate_id,
    c.name as candidate_name,
    COUNT(v.id) as votes_count,
    CASE 
      WHEN total_votes > 0 THEN ROUND((COUNT(v.id)::NUMERIC / total_votes::NUMERIC) * 100, 2)
      ELSE 0
    END as percentage
  FROM candidates c
  LEFT JOIN votes v ON c.id = v.candidate_id
  GROUP BY c.id, c.name
  ORDER BY votes_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Insert data sample (opsional)
-- Uncomment untuk insert data sample

-- Insert sample admin user
-- INSERT INTO users (id, name, email, role) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@osis.com', 'admin');

-- Insert sample panitia user
-- INSERT INTO users (id, name, email, role) VALUES 
-- ('00000000-0000-0000-0000-000000000002', 'Panitia', 'panitia@osis.com', 'panitia');

-- Insert sample member user
-- INSERT INTO users (id, name, email, role) VALUES 
-- ('00000000-0000-0000-0000-000000000003', 'Member', 'member@osis.com', 'member');

-- Insert sample candidates
-- INSERT INTO candidates (name, photo_url, vision, mission) VALUES 
-- ('Ahmad Rizki', 'https://example.com/ahmad.jpg', 'Mewujudkan OSIS yang inovatif dan berprestasi', '1. Meningkatkan kualitas kegiatan ekstrakurikuler\n2. Membangun komunikasi yang baik antar siswa\n3. Mengadakan program pengembangan diri'),
-- ('Siti Nurhaliza', 'https://example.com/siti.jpg', 'OSIS yang solid dan berkarakter', '1. Memperkuat solidaritas antar siswa\n2. Mengadakan kegiatan keagamaan\n3. Meningkatkan prestasi akademik dan non-akademik'),
-- ('Budi Santoso', 'https://example.com/budi.jpg', 'OSIS yang kreatif dan mandiri', '1. Mengembangkan bakat dan minat siswa\n2. Menciptakan lingkungan sekolah yang kondusif\n3. Membangun kerjasama dengan pihak luar');

-- Insert sample election
-- INSERT INTO elections (start_date, end_date, is_active) VALUES 
-- (NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', true);

-- 10. Buat function untuk mendapatkan events dengan status
CREATE OR REPLACE FUNCTION get_events_by_status(event_status VARCHAR)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.title, e.description, e.start_date, e.end_date, e.status, e.created_by, e.approved_by, e.created_at
  FROM events e
  WHERE e.status = event_status
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Buat function untuk mendapatkan notifications user
CREATE OR REPLACE FUNCTION get_user_notifications(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.is_read, n.created_at
  FROM notifications n
  WHERE n.user_id = user_uuid
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Buat view untuk dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM candidates) as total_candidates,
  (SELECT COUNT(*) FROM users WHERE role = 'member') as total_voters,
  (SELECT COUNT(*) FROM votes) as total_votes,
  (SELECT COUNT(*) FROM elections WHERE is_active = true) as active_elections,
  (SELECT COUNT(*) FROM events WHERE status = 'pending') as pending_events,
  (SELECT COUNT(*) FROM events WHERE status = 'approved') as approved_events;

-- 11. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
