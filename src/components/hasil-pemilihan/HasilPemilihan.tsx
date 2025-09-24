"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconTrophy, IconUsers, IconBallpen, IconRefresh, IconChartBar } from "@tabler/icons-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { supabase } from "@/lib/supabase"

interface VoteResult {
  candidate_id: string
  candidate_name: string
  candidate_class: string
  candidate_photo: string
  votes: number
  percentage: number
}

interface ElectionStatus {
  is_active: boolean
  election_name: string
}

export function HasilPemilihan() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [totalVoters, setTotalVoters] = useState(0)
  const [, setElectionStatus] = useState<ElectionStatus>({ is_active: true, election_name: "Pemilihan Ketua OSIS" })
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      // Ambil semua suara dari schema baru: voters (has_voted = true)
      const { data: voterRows } = await supabase
        .from('voters')
        .select('voted_for')
        .eq('has_voted', true)

      const byCandidate: Record<number, number> = {}
      for (const row of voterRows || []) {
        if (row.voted_for == null) continue
        byCandidate[row.voted_for] = (byCandidate[row.voted_for] || 0) + 1
      }
      const candidateIds = Object.keys(byCandidate).map(Number)
      const totalVotesCount = (voterRows || []).length

      // Ambil info kandidat dengan class
      let candMap: Record<string, { name: string; class: string; photo: string }> = {}
      if (candidateIds.length > 0) {
        const { data: candRows } = await supabase
          .from('candidates')
          .select('id, name, class, photo_url')
          .in('id', candidateIds)
        candMap = Object.fromEntries(((candRows as Array<{ id: number; name: string; class: string | null; photo_url: string | null }> | null) || []).map((c) => [c.id, { name: c.name, class: c.class || 'Unknown', photo: c.photo_url || '' }]))
      }

      // Ambil semua kandidat untuk total count
      const { count: candidatesCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })

      // Ambil total voters (semua pemilih terdaftar)
      const { count: votersCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })

      // Ambil status pemilihan
      const { data: electionData } = await supabase
        .from('election_settings')
        .select('election_name, is_active')
        .single()

      // Susun hasil
      const resultsComputed: VoteResult[] = candidateIds.map(id => {
        const votes = byCandidate[id] || 0
        const name = candMap[id]?.name || String(id)
        const class_name = candMap[id]?.class || 'Unknown'
        const photo = candMap[id]?.photo || ''
        const percentage = totalVotesCount > 0 ? Math.round((votes / totalVotesCount) * 100) : 0
        return { candidate_id: String(id), candidate_name: name, candidate_class: class_name, candidate_photo: photo, votes, percentage }
      }).sort((a, b) => b.votes - a.votes)

      setResults(resultsComputed)
      setTotalVotes(totalVotesCount)
      setTotalCandidates(candidatesCount || 0)
      setTotalVoters(votersCount || 0)
      setElectionStatus({
        is_active: electionData?.is_active ?? true,
        election_name: electionData?.election_name ?? "Pemilihan Ketua OSIS"
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
        <h1 className="text-2xl font-bold">Hasil Pemilihan Ketua OSIS</h1>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  const winner = results.length > 0 ? results[0] : null
  const participationPercent = totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hasil Pemilihan Ketua OSIS</h1>
        <p className="text-gray-600 mt-1">Lihat hasil pemilihan dan statistik voting</p>
      </div>

      {/* Pemenang Sementara Card */}
      {winner && (
        <Card className="bg-orange-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <IconTrophy className="h-12 w-12 text-orange-200" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">Pemenang Sementara</h2>
                <h3 className="text-2xl font-bold mb-1">{winner.candidate_name}</h3>
                <p className="text-orange-100 mb-1">{winner.candidate_class}</p>
                <p className="text-orange-200 text-sm">{winner.votes} suara</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Suara</CardTitle>
            <IconBallpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalVotes}</div>
            <p className="text-xs text-gray-500">suara sah yang masuk</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tingkat Partisipasi</CardTitle>
            <IconUsers className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{participationPercent}%</div>
            <p className="text-xs text-gray-500">pemilih berpartisipasi</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jumlah Kandidat</CardTitle>
            <IconChartBar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCandidates}</div>
            <p className="text-xs text-gray-500">kandidat berpartisipasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Hasil Pemilihan</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Total suara: {totalVotes}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
                className={chartType === 'pie' ? 'bg-blue-600 text-white' : ''}
              >
                Pie Chart
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'bg-blue-600 text-white' : ''}
              >
                Bar Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchResults}
                className="flex items-center gap-2"
              >
                <IconRefresh className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
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
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
