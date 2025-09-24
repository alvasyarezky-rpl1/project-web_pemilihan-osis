"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase, Candidate } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { IconSearch, IconUser, IconCalendar, IconTarget } from "@tabler/icons-react"

export function ProfilKandidat() {
  const { isMember } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [voteMap, setVoteMap] = useState<Record<number, number>>({})

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, class, photo_url, vision, mission, created_at')
        .order('id', { ascending: false })

      if (error) throw error
      setCandidates(data || [])

      // Hitung jumlah suara per kandidat dari voters
      const { data: votes } = await supabase
        .from('voters')
        .select('voted_for')
        .eq('has_voted', true)

      const map: Record<number, number> = {}
      for (const r of votes || []) {
        if (r.voted_for == null) continue
        map[r.voted_for] = (map[r.voted_for] || 0) + 1
      }
      setVoteMap(map)
    } catch (error) {
      console.error('ProfilKandidat: Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter(candidate =>
    (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Profil Kandidat</h1>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profil Kandidat</h1>
        <Badge variant="outline">{candidates.length} kandidat</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari kandidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="overflow-hidden hover:shadow-md transition-all rounded-lg border">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-center mb-4">
                {candidate.photo_url ? (
                  <img src={candidate.photo_url} alt={candidate.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3">
                <CardTitle className="text-2xl text-gray-800">{candidate.name}</CardTitle>
                <Badge variant="outline">{voteMap[candidate.id] || 0} suara</Badge>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <IconUser className="h-4 w-4" />
                <span>{candidate.class || 'Kandidat Ketua OSIS'}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Visi */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconTarget className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-lg text-gray-800">Visi</h4>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {candidate.vision || '-'}
                </p>
              </div>

              {/* Misi */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconTarget className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-lg text-gray-800">Misi</h4>
                </div>
                <div className="text-sm leading-relaxed text-gray-700 bg-green-50 p-3 rounded-lg">
                  {(candidate.mission || '-').split('\n').map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>

              {/* Aksi (hanya untuk Anggota) */}
              {isMember && (
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" className="rounded-md">Lihat Detail</Button>
                  <a href="/dashboard/pilih-kandidat">
                    <Button className="rounded-md">Pilih</Button>
                  </a>
                </div>
              )}
              {/* Info Tambahan */}
              <div className="pt-2 border-t border-gray-100 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <IconCalendar className="h-4 w-4" />
                <span>
                  Terdaftar: {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }) : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {searchTerm ? 'Tidak ada kandidat ditemukan' : 'Belum ada kandidat terdaftar'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
