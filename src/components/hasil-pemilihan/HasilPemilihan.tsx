"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconChartBar, IconTrophy, IconUsers, IconBallpen } from "@tabler/icons-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface VoteResult {
  candidate_id: string
  candidate_name: string
  candidate_photo: string
  votes: number
  percentage: number
}

export function HasilPemilihan() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [totalVoters, setTotalVoters] = useState(0)
  const [loading, setLoading] = useState(true)

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

      // Ambil info kandidat
      let candMap: Record<string, { name: string; photo: string }> = {}
      if (candidateIds.length > 0) {
        const { data: candRows } = await supabase
          .from('candidates')
          .select('id, name, photo_url')
          .in('id', candidateIds)
        candMap = Object.fromEntries(((candRows as Array<{ id: number; name: string; photo_url: string | null }> | null) || []).map((c) => [c.id, { name: c.name, photo: c.photo_url || '' }]))
      }

      // Total voters: gunakan jumlah baris voters (atau yang has_voted/semua)
      const { count: votersCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })

      // Susun hasil
      const resultsComputed: VoteResult[] = candidateIds.map(id => {
        const votes = byCandidate[id] || 0
        const name = candMap[id]?.name || String(id)
        const photo = candMap[id]?.photo || ''
        const percentage = totalVotesCount > 0 ? Math.round((votes / totalVotesCount) * 100) : 0
        return { candidate_id: String(id), candidate_name: name, candidate_photo: photo, votes, percentage }
      }).sort((a, b) => b.votes - a.votes)

      setResults(resultsComputed)
      setTotalVotes(totalVotesCount)
      setTotalVoters(votersCount || 0)
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Hasil Pemilihan</h1>
        <Badge variant="default">{totalVotes} suara</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suara</CardTitle>
            <IconBallpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              dari {totalVoters} pemilih terdaftar
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
              {totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0}%
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

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Hasil Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.candidate_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  {result.candidate_photo ? (
                    <Image
                      src={result.candidate_photo}
                      alt={result.candidate_name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <IconUsers className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{result.candidate_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.votes} suara ({result.percentage}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && totalVotes > 0 && (
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
            {results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada hasil pemilihan
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
