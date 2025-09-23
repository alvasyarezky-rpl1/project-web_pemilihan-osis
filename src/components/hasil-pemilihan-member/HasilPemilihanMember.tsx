"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconChartBar, IconTrophy, IconUsers, IconBallpen, IconCalendar, IconCheck } from "@tabler/icons-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { supabase } from "@/lib/supabase"

interface VoteResult {
  candidate_id: string
  candidate_name: string
  candidate_photo: string
  votes: number
  percentage: number
}

interface ElectionInfo {
  start_date: string
  end_date: string
  is_active: boolean
  total_voters: number
  total_votes: number
  participation_rate: number
}

export function HasilPemilihanMember() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [electionInfo, setElectionInfo] = useState<ElectionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      // Gunakan election_settings sebagai sumber status (new schema)
      const { data: settings } = await supabase
        .from('election_settings')
        .select('start_date, end_date, is_active')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()

      const start = settings?.start_date || ''
      const end = settings?.end_date || ''

      // Ambil suara dari voters
      const { data: voterRows } = await supabase
        .from('voters')
        .select('voted_for')
        .eq('has_voted', true)

      const totalVotes = (voterRows || []).length
      const byCandidate: Record<number, number> = {}
      for (const row of voterRows || []) {
        if (row.voted_for == null) continue
        byCandidate[row.voted_for] = (byCandidate[row.voted_for] || 0) + 1
      }
      const candidateIds = Object.keys(byCandidate).map(Number)

      let candMap: Record<number, { name: string; photo: string }> = {}
      if (candidateIds.length > 0) {
        const { data: candRows } = await supabase
          .from('candidates')
          .select('id, name, photo_url')
          .in('id', candidateIds)
        candMap = Object.fromEntries(((candRows as Array<{ id: number; name: string; photo_url: string | null }> | null) || []).map((c) => [c.id, { name: c.name, photo: c.photo_url || '' }]))
      }

      const resultsComputed: VoteResult[] = candidateIds.map(id => {
        const votes = byCandidate[id] || 0
        const name = candMap[id]?.name || String(id)
        const photo = candMap[id]?.photo || ''
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
        return { candidate_id: String(id), candidate_name: name, candidate_photo: photo, votes, percentage }
      }).sort((a, b) => b.votes - a.votes)

      // Total voters = jumlah baris voters
      const { count: votersCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })

      setResults(resultsComputed)
      setElectionInfo({
        start_date: start,
        end_date: end,
        is_active: Boolean(settings?.is_active),
        total_voters: votersCount,
        total_votes: totalVotes,
        participation_rate: votersCount > 0 ? Math.round((totalVotes / votersCount) * 100) : 0
      })
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = results.map(result => ({
    name: result.candidate_name,
    votes: result.votes,
    percentage: result.percentage
  }))

  const pieData = results.map(result => ({
    name: result.candidate_name,
    value: result.votes,
    percentage: result.percentage
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Hasil Pemilihan</h1>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dengan status pemilihan */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hasil Pemilihan Ketua OSIS</h1>
          <p className="text-muted-foreground">Hasil final pemilihan yang sudah ditutup</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <IconCheck className="h-4 w-4 text-green-600" />
          Pemilihan Selesai
        </Badge>
      </div>

      {/* Informasi Pemilihan */}
      {electionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Informasi Pemilihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Pemilihan</p>
                <p className="font-medium">
                  {new Date(electionInfo.start_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waktu</p>
                <p className="font-medium">
                  {new Date(electionInfo.start_date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(electionInfo.end_date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pemilih</p>
                <p className="font-medium">{electionInfo.total_voters} orang</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tingkat Partisipasi</p>
                <p className="font-medium text-green-600">{electionInfo.participation_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suara</CardTitle>
            <IconBallpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.reduce((sum, result) => sum + result.votes, 0)}</div>
            <p className="text-xs text-muted-foreground">
              suara sah yang masuk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Partisipasi</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {electionInfo?.participation_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              pemilih berpartisipasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kandidat</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">
              kandidat berpartisipasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hasil Suara (Bar Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Suara (Pie Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hasil Final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="h-5 w-5 text-yellow-500" />
            Hasil Final Pemilihan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.candidate_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {result.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{result.candidate_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.votes} suara ({result.percentage}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Badge variant="default" className="bg-yellow-500">
                      <IconTrophy className="mr-1 h-3 w-3" />
                      Pemenang
                    </Badge>
                  )}
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
