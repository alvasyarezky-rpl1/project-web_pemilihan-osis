"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useCallback } from "react"
import { IconUsers, IconBallpen } from "@tabler/icons-react"

interface StatsData {
  totalCandidates: number
  totalVoters: number
  votedCount: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalCandidates: 0,
    totalVoters: 0,
    votedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      // Fetch candidates count
      const { count: candidatesCount } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })

      // Fetch voters count (jumlah baris voters)
      const { count: votersCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })

      // Fetch voted count (has_voted = true)
      const { count: votesCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .eq('has_voted', true)

      setStats({
        totalCandidates: candidatesCount || 0,
        totalVoters: votersCount || 0,
        votedCount: votesCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Realtime: update counts when voters table changes
  useEffect(() => {
    const channel = supabase
      .channel('statscards-voters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => fetchStats())
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [fetchStats])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kandidat</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCandidates}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemilih Terdaftar</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVoters}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sudah Memilih</CardTitle>
          <IconBallpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.votedCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalVoters > 0 ? Math.round((stats.votedCount / stats.totalVoters) * 100) : 0}% dari total pemilih
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
