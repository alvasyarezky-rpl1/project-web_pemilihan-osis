"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, Candidate } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { IconBallpen, IconCheck, IconClock, IconUser } from "@tabler/icons-react"
import { toast } from "sonner"
import Image from "next/image"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybe = (error as { message?: unknown }).message
    if (typeof maybe === 'string') return maybe
  }
  return String(error)
}

export function PilihKandidat() {
  useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [selectedWakil, setSelectedWakil] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [electionStatus, setElectionStatus] = useState<'upcoming' | 'active' | 'ended' | 'none'>('none')
  const [eventInfo, setEventInfo] = useState<{ id: string, title: string, start_date: string, end_date: string, status: string } | null>(null)
  const [joined, setJoined] = useState(false)
  const [teams, setTeams] = useState<Array<{ id: number, team_name: string, ketua?: Candidate, wakil?: Candidate }>>([])
  const [showVoterForm, setShowVoterForm] = useState(false)
  const [voterName, setVoterName] = useState<string>("")
  const [voterClass, setVoterClass] = useState<string>("")
  const [voterEmail, setVoterEmail] = useState<string>("")
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({})

  const fetchData = useCallback(async () => {
    try {
      // generate device uuid for anonymous actions
      const getDeviceUserId = (): string => {
        if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000000'
        let id = localStorage.getItem('guest_uuid')
        if (!id) {
          id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })
          localStorage.setItem('guest_uuid', id)
        }
        return id
      }
      const deviceUserId = getDeviceUserId()

      // Get latest election settings (new schema)
      const { data: election } = await supabase
        .from('election_settings')
        .select('id, start_date, end_date, is_active, allow_voting')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (election) {
        const now = new Date()
        const startDate = election.start_date ? new Date(election.start_date) : new Date()
        const endDate = election.end_date ? new Date(election.end_date) : new Date()
        // election.id may be used later if needed
        
        if (now < startDate) {
          setElectionStatus('upcoming')
        } else if (now > endDate) {
          setElectionStatus('ended')
        } else {
          setElectionStatus('active')
        }
        // Check if this voter (by name+class if available) already voted using voters table
        if (typeof window !== 'undefined') {
          const n = localStorage.getItem('voter_name') || ''
          const k = localStorage.getItem('voter_class') || ''
          if (n && k) {
            const { data: voterRow } = await supabase
              .from('voters')
              .select('id, has_voted')
              .eq('name', n)
              .eq('class', k)
              .maybeSingle()
            if (voterRow?.has_voted) setHasVoted(true)
          }
        }
      } else {
        setElectionStatus('none')
      }

      // Fetch latest approved/active event and its teams
      const { data: eventActive } = await supabase
        .from('events')
        .select('*')
        .in('status', ['active','approved'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (eventActive) {
        setEventInfo({ id: eventActive.id, title: eventActive.title, start_date: eventActive.start_date, end_date: eventActive.end_date, status: eventActive.status })
        const { data: joinRow } = await supabase
          .from('event_participants')
          .select('id, has_voted')
          .eq('event_id', eventActive.id)
          .eq('user_id', deviceUserId)
          .maybeSingle()
        if (joinRow) {
          setJoined(true)
          if ((joinRow as { id: string; has_voted: boolean | null } | null)?.has_voted) setHasVoted(true)
        }

        const { data: teamRows } = await supabase
          .from('event_teams')
          .select('id, team_name, ketua_candidate_id, wakil_candidate_id')
          .eq('event_id', eventActive.id)
          .order('created_at', { ascending: true })

        type TeamRow = { id: number; team_name: string; ketua_candidate_id: number; wakil_candidate_id: number | null }
        const ids = Array.from(new Set(((teamRows as TeamRow[] | null) || []).flatMap(t => [t.ketua_candidate_id, t.wakil_candidate_id]).filter((v): v is number => v != null))) as number[]
        let candMap: Record<number, Candidate> = {}
        if (ids.length > 0) {
          const { data: candRows } = await supabase
            .from('candidates')
            .select('id, name, class, photo_url, vision, mission, votes, created_at')
            .in('id', ids)
          candMap = Object.fromEntries(((candRows as Candidate[] | null) || []).map(c => [c.id, c]))
        }
        const combined = ((teamRows as TeamRow[] | null) || []).map(t => ({
          id: t.id,
          team_name: t.team_name,
          ketua: candMap[t.ketua_candidate_id],
          wakil: t.wakil_candidate_id != null ? candMap[t.wakil_candidate_id] : undefined
        }))
        setTeams(combined)
      }

      // Fallback list candidates if no teams (new columns)
      if (!eventInfo) {
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('id, name, class, photo_url, vision, mission, votes, created_at')
          .order('id', { ascending: false })
        setCandidates(candidatesData || [])

        // hitung jumlah suara per kandidat dari voters
        const { data: voteRows } = await supabase
          .from('voters')
          .select('voted_for')
          .eq('has_voted', true)
        type VoterVoteRow = { voted_for: number | null }
        const map: Record<number, number> = {}
        for (const r of ((voteRows as VoterVoteRow[] | null) || [])) {
          if (r.voted_for == null) continue
          const idNum = Number(r.voted_for)
          map[idNum] = (map[idNum] || 0) + 1
        }
        setVoteCounts(map)
      }

      // Prefill voter info from localStorage
      if (typeof window !== 'undefined') {
        const n = localStorage.getItem('voter_name') || ''
        const k = localStorage.getItem('voter_class') || ''
        const e = localStorage.getItem('voter_email') || ''
        setVoterName(n)
        setVoterClass(k)
        setVoterEmail(e)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [eventInfo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleVote = async () => {
    if (!selectedCandidate) return
    if (!voterName.trim() || !voterClass.trim()) { toast.error('Nama dan Kelas wajib diisi'); return }
    setVoting(true)
    try {
      const name = voterName.trim()
      const cls = voterClass.trim()

      // Find existing voter by name+class
      const { data: existing } = await supabase
        .from('voters')
        .select('id, has_voted')
        .eq('name', name)
        .eq('class', cls)
        .maybeSingle()

      if (existing?.has_voted) {
        toast.warning('Anda sudah memilih')
        setHasVoted(true)
        return
      }

      if (!existing) {
        const { error } = await supabase.from('voters').insert({
          name,
          class: cls,
          email: voterEmail.trim() || null,
          has_voted: true,
          voted_at: new Date().toISOString(),
          voted_for: Number(selectedCandidate),
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('voters')
          .update({
            email: voterEmail.trim() || null,
            has_voted: true,
            voted_at: new Date().toISOString(),
            voted_for: Number(selectedCandidate),
          })
          .eq('id', existing.id)
        if (error) throw error
      }

      toast.success('Terima kasih! Suara Anda telah tercatat.')
      setHasVoted(true)
      setSelectedCandidate(null)
      await fetchData()
    } catch (error: unknown) {
      const msg = getErrorMessage(error) || 'Gagal memilih'
      console.error('Error voting:', error)
      toast.error(msg)
    } finally {
      setVoting(false)
    }
  }

  const handleSubmitTeamVote = async () => {
    // Pada skema baru, hanya ada satu voted_for. Ambil prioritas ketua; jika tidak ada, gunakan wakil.
    const choice = selectedCandidate ?? selectedWakil
    if (!choice) return
    // gunakan handler umum
    await handleVote()
  }

  const handleJoinEvent = async () => {
    if (!eventInfo) return
    const deviceUserId = (typeof window !== 'undefined' && localStorage.getItem('guest_uuid')) || ''
    if (!deviceUserId) return
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventInfo.id, user_id: deviceUserId })
      if (error && (error as { code?: string }).code !== '23505') throw error
      setJoined(true)
      toast.success('Berhasil bergabung ke event')
    } catch (e) {
      console.error('Join event error:', e)
      toast.error('Gagal bergabung ke event')
    }
  }

  const getStatusMessage = () => {
    if (hasVoted) {
      return {
        icon: <IconCheck className="h-5 w-5 text-green-500" />,
        message: "Anda telah memilih",
        description: "Terima kasih telah berpartisipasi dalam pemilihan ketua OSIS."
      }
    }

    switch (electionStatus) {
      case 'upcoming':
        return {
          icon: <IconClock className="h-5 w-5 text-yellow-500" />,
          message: "Pemilihan belum dimulai",
          description: "Pemilihan akan dimulai sesuai jadwal yang telah ditentukan."
        }
      case 'active':
        return {
          icon: <IconBallpen className="h-5 w-5 text-blue-500" />,
          message: "Pemilihan sedang berlangsung",
          description: "Silakan pilih kandidat yang menurut Anda paling tepat."
        }
      case 'ended':
        return {
          icon: <IconClock className="h-5 w-5 text-gray-500" />,
          message: "Pemilihan telah berakhir",
          description: "Waktu pemilihan telah habis."
        }
      default:
        return {
          icon: <IconClock className="h-5 w-5 text-gray-500" />,
          message: "Tidak ada pemilihan aktif",
          description: "Belum ada pemilihan yang sedang berlangsung."
        }
    }
  }

  getStatusMessage()
  // Longgarkan agar user bisa memilih selama belum pernah memilih
  const canVote = !hasVoted

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Pilih Kandidat</h1>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Pilih Kandidat</h1>
      </div>

      {/* Event & Teams */}
      {eventInfo && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Kandidat untuk event: {eventInfo.title}</h2>
          {!joined && (
            <Button size="sm" variant="outline" onClick={handleJoinEvent}>Join Event</Button>
          )}
          {teams.length > 0 && (
            <div className="space-y-4">
              {teams.map((t, idx) => (
                <div key={t.id} className="space-y-2">
                  <div className="text-sm text-gray-600">Kandidat {idx + 1} (Tim)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ketua */}
                    <Card
                      className={`${selectedCandidate === t.ketua?.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${canVote ? 'cursor-pointer' : 'opacity-50'}`}
                      onClick={() => canVote && t.ketua?.id && setSelectedCandidate(t.ketua.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm">Ketua</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            {t.ketua?.photo_url ? (
                              <Image src={t.ketua.photo_url} alt={t.ketua.name} width={64} height={64} className="rounded-full object-cover" />
                            ) : (
                              <IconUser className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{t.ketua?.name || '-'}</div>
                            <div className="text-xs text-gray-600 line-clamp-2">{t.ketua?.vision}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Wakil */}
                    <Card
                      className={`${selectedWakil === t.wakil?.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${canVote && t.wakil ? 'cursor-pointer' : 'opacity-50'}`}
                      onClick={() => canVote && t.wakil?.id && setSelectedWakil(t.wakil.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm">Wakil</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            {t.wakil?.photo_url ? (
                              <Image src={t.wakil.photo_url} alt={t.wakil.name} width={64} height={64} className="rounded-full object-cover" />
                            ) : (
                              <IconUser className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{t.wakil?.name || 'Belum ada wakil'}</div>
                            {t.wakil && <div className="text-xs text-gray-600 line-clamp-2">{t.wakil.vision}</div>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fallback Candidates */}
      {teams.length === 0 && candidates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Daftar Kandidat</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <Card 
                key={candidate.id}
                className={`transition-all rounded-lg ${canVote ? 'hover:shadow-md' : 'opacity-50'}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-center gap-3">
                    {candidate.photo_url ? (
                      <Image
                        src={candidate.photo_url}
                        alt={candidate.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <IconUser className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <div className="text-xs text-gray-500">{candidate.class || '-'}</div>
                    </div>
                    <Badge variant="outline">{voteCounts[candidate.id] || 0} suara</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Visi</h4>
                    <p className="text-sm line-clamp-3">{candidate.vision}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Misi</h4>
                    <p className="text-sm line-clamp-3">{candidate.mission}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button variant="outline" onClick={() => toast.info('Detail kandidat belum diimplementasikan')}>Lihat Detail</Button>
                    <Button onClick={() => { if (!canVote) return; setSelectedCandidate(candidate.id); setShowVoterForm(true) }}>Pilih</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vote Button */}
      {teams.length > 0 && canVote && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setShowVoterForm(true)} disabled={!selectedCandidate || voting} className="px-8">
            <IconBallpen className="mr-2 h-5 w-5" />
            {voting ? 'Memproses...' : 'Kirim Pilihan Tim'}
          </Button>
        </div>
      )}

      {teams.length === 0 && canVote && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setShowVoterForm(true)} disabled={!selectedCandidate || voting} className="px-8">
            <IconBallpen className="mr-2 h-5 w-5" />
            {voting ? 'Memproses...' : 'Pilih Kandidat Ini'}
          </Button>
        </div>
      )}

      {/* Voter Info Modal */}
      {showVoterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Data Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Nama</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Kelas</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={voterClass}
                    onChange={(e) => setVoterClass(e.target.value)}
                    placeholder="Contoh: XII IPA 3"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowVoterForm(false)}>Batal</Button>
                  <Button onClick={() => {
                    if (!voterName.trim() || !voterClass.trim()) { toast.error('Nama dan Kelas wajib diisi'); return }
                    if (!voterEmail.trim()) { toast.error('Email wajib diisi'); return }
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('voter_name', voterName.trim())
                      localStorage.setItem('voter_class', voterClass.trim())
                      localStorage.setItem('voter_email', voterEmail.trim())
                    }
                    setShowVoterForm(false)
                    // Tentukan flow team atau single
                    if (teams.length > 0) {
                      handleSubmitTeamVote()
                    } else {
                      // submit single vote dengan nama/kelas
                      ;(async () => {
                        if (!selectedCandidate) return
                        setVoting(true)
                        try {
                          // Simpan ke voters sesuai skema baru
                          const name = voterName.trim()
                          const cls = voterClass.trim()
                          const mail = voterEmail.trim()
                          const { data: existing } = await supabase
                            .from('voters')
                            .select('id, has_voted')
                            .eq('name', name)
                            .eq('class', cls)
                            .maybeSingle()
                          if (existing?.has_voted) {
                            toast.warning('Anda sudah memilih')
                          } else if (!existing) {
                            const { error } = await supabase.from('voters').insert({
                              name,
                              class: cls,
                              email: mail,
                              has_voted: true,
                              voted_at: new Date().toISOString(),
                              voted_for: Number(selectedCandidate),
                            })
                            if (error) throw error
                          } else {
                            const { error } = await supabase
                              .from('voters')
                              .update({ email: mail, has_voted: true, voted_at: new Date().toISOString(), voted_for: Number(selectedCandidate) })
                              .eq('id', existing.id)
                            if (error) throw error
                          }
                          toast.success('Suara tersimpan')
                          setHasVoted(true)
                          setSelectedCandidate(null)
                          await fetchData()
                        } catch (e: unknown) {
                          const msg = getErrorMessage(e) || 'Gagal menyimpan suara'
                          console.error('Insert voters error:', e)
                          toast.error(msg)
                        } finally { setVoting(false) }
                      })()
                    }
                  }}>Simpan & Kirim</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {candidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              Belum ada kandidat yang terdaftar
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
