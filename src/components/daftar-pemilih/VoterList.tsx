"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

type Voter = {
  id: number
  name: string
  class: string
  has_voted: boolean | null
  voted_at: string | null
  voted_for: number | null
}

type CandidateMap = Record<number, string>

export function VoterList() {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState<Voter[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "voted" | "not_voted">("all")

  const [candMap, setCandMap] = useState<CandidateMap>({})

  useEffect(() => {
    load()
    const ch = supabase
      .channel('voter-list-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => load())
      .subscribe()
    return () => { try { supabase.removeChannel(ch) } catch {} }
  }, [])

  async function load() {
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('id, name, class, has_voted, voted_at, voted_for')
        .order('voted_at', { ascending: false, nullsFirst: false })
      if (error) throw error
      setRows(((data ?? []) as Voter[]))

      // build candidate map
      const dataTyped = ((data ?? []) as Voter[])
      const ids = Array.from(new Set(dataTyped.map((v) => v.voted_for).filter((x): x is number => x != null)))
      if (ids.length > 0) {
        const { data: cands } = await supabase
          .from('candidates')
          .select('id, name')
          .in('id', ids)
        const candsTyped = ((cands ?? []) as { id: number; name: string }[])
        setCandMap(Object.fromEntries(candsTyped.map((c) => [c.id, c.name])))
      } else {
        setCandMap({})
      }
    } finally {
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      if (filter === 'voted' && !r.has_voted) return false
      if (filter === 'not_voted' && r.has_voted) return false
      return (r.name || '').toLowerCase().includes(q) || (r.class || '').toLowerCase().includes(q)
    })
  }, [rows, search, filter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daftar Pemilih</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar pemilih dan status voting</p>
        </div>
        <Badge variant="outline">{rows.length} pemilih</Badge>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 items-center">
            <Input placeholder="Cari nama atau kelas..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Semua</Button>
              <Button variant={filter === 'voted' ? 'default' : 'outline'} onClick={() => setFilter('voted')}>Sudah Memilih</Button>
              <Button variant={filter === 'not_voted' ? 'default' : 'outline'} onClick={() => setFilter('not_voted')}>Belum Memilih</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">No</th>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Kelas</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Pilihan</th>
                <th className="text-left p-3">Waktu Voting</th>
                {isAdmin && <th className="text-left p-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.class}</td>
                  <td className="p-3">
                    {r.has_voted ? (
                      <Badge variant="default">Sudah Memilih</Badge>
                    ) : (
                      <Badge variant="outline">Belum Memilih</Badge>
                    )}
                  </td>
                  <td className="p-3">{r.voted_for != null ? (candMap[r.voted_for] || r.voted_for) : '-'}</td>
                  <td className="p-3">{r.voted_at ? new Date(r.voted_at).toLocaleString('id-ID') : '-'}</td>
                  {isAdmin && (
                    <td className="p-3">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (!confirm(`Hapus pemilih ${r.name}?`)) return
                          const { error } = await supabase.from('voters').delete().eq('id', r.id)
                          if (error) {
                            console.error(error)
                            alert('Gagal menghapus')
                          } else {
                            await load()
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={isAdmin ? 7 : 6}>Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}


