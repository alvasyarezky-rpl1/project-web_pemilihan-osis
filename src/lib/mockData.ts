import { User, Election } from './supabase'

// Mock data untuk demo
interface Candidate {
  id: string
  nama: string
  foto_url: string
  visi: string
  misi: string
  program_kerja: string
  tanggal_dibuat: string
}
export const mockUser: User = {
  id: 'demo-user-1',
  name: 'Admin Demo',
  email: 'admin@demo.com',
  role: 'admin',
  created_at: new Date().toISOString()
}

export const mockCandidates: Candidate[] = [
  {
    id: 'candidate-1',
    nama: 'Ahmad Rizki',
    foto_url: '', // Kosongkan untuk menggunakan placeholder
    visi: 'Mewujudkan OSIS yang inovatif dan berprestasi untuk kemajuan sekolah',
    misi: '1. Meningkatkan kualitas kegiatan ekstrakurikuler\n2. Membangun komunikasi yang baik antar siswa\n3. Mengadakan program pengembangan diri\n4. Menciptakan lingkungan belajar yang kondusif',
    program_kerja: '1. Program "Siswa Berprestasi" - memberikan penghargaan dan dukungan untuk siswa berprestasi\n2. Program "Digital Learning" - memfasilitasi pembelajaran digital yang efektif\n3. Program "Green School" - menciptakan lingkungan sekolah yang ramah lingkungan\n4. Program "Student Exchange" - mengadakan pertukaran pelajar dengan sekolah lain\n5. Program "Entrepreneurship" - mengembangkan jiwa kewirausahaan siswa',
    tanggal_dibuat: new Date().toISOString()
  },
  {
    id: 'candidate-2',
    nama: 'Siti Nurhaliza',
    foto_url: '', // Kosongkan untuk menggunakan placeholder
    visi: 'OSIS yang solid dan berkarakter untuk membangun generasi unggul',
    misi: '1. Memperkuat solidaritas antar siswa\n2. Mengadakan kegiatan keagamaan\n3. Meningkatkan prestasi akademik dan non-akademik\n4. Membangun karakter siswa yang berakhlak mulia',
    program_kerja: '1. Program "Religious Week" - mengadakan kegiatan keagamaan rutin\n2. Program "Character Building" - membangun karakter siswa melalui berbagai kegiatan\n3. Program "Academic Excellence" - mendukung prestasi akademik siswa\n4. Program "Community Service" - mengadakan bakti sosial ke masyarakat\n5. Program "Cultural Festival" - melestarikan dan mengembangkan budaya lokal',
    tanggal_dibuat: new Date().toISOString()
  },
  {
    id: 'candidate-3',
    nama: 'Budi Santoso',
    foto_url: '',
    visi: 'OSIS yang kreatif dan mandiri untuk kemajuan bersama',
    misi: '1. Mengembangkan bakat dan minat siswa\n2. Menciptakan lingkungan sekolah yang kondusif\n3. Membangun kerjasama dengan pihak luar\n4. Meningkatkan partisipasi siswa dalam kegiatan sekolah',
    program_kerja: '1. Program "Talent Show" - mengadakan kompetisi bakat siswa\n2. Program "Creative Workshop" - mengadakan workshop kreativitas\n3. Program "School Partnership" - membangun kerjasama dengan sekolah dan instansi lain\n4. Program "Student Council" - membentuk dewan siswa yang aktif\n5. Program "Innovation Lab" - menciptakan ruang untuk inovasi siswa',
    tanggal_dibuat: new Date().toISOString()
  }
]

export const mockElection: Election = {
  id: 'election-1',
  start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 hari yang lalu
  end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 hari lagi
  is_active: true
}

export const mockVotes = [
  { id: 'vote-1', user_id: 'user-1', candidate_id: 'candidate-1', voted_at: new Date().toISOString() },
  { id: 'vote-2', user_id: 'user-2', candidate_id: 'candidate-2', voted_at: new Date().toISOString() },
  { id: 'vote-3', user_id: 'user-3', candidate_id: 'candidate-1', voted_at: new Date().toISOString() },
  { id: 'vote-4', user_id: 'user-4', candidate_id: 'candidate-3', voted_at: new Date().toISOString() },
  { id: 'vote-5', user_id: 'user-5', candidate_id: 'candidate-2', voted_at: new Date().toISOString() }
]

export const mockUsers: User[] = [
  mockUser,
  {
    id: 'user-2',
    name: 'Panitia Demo',
    email: 'panitia@demo.com',
    role: 'panitia',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-3',
    name: 'Siswa Demo',
    email: 'siswa@demo.com',
    role: 'member',
    created_at: new Date().toISOString()
  }
]