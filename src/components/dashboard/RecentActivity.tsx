"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState, useCallback } from "react"
import { IconBallpen, IconUser, IconPlus, IconSettings } from "@tabler/icons-react"
import { supabase } from "@/lib/supabase"

interface Activity {
  id: string
  type: 'vote' | 'candidate_added' | 'election_updated' | 'user_added'
  message: string
  timestamp: string
}

export function RecentActivity() {
  const { isAdmin, isPanitia } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentActivity = useCallback(async () => {
    try {
      const items: Activity[] = []

      type VoterRow = {
        name: string
        class: string
        voted_for: number | null
        voted_at: string | null
      }
      type CandidateNameRow = {
        id: number
        name: string
      }
      type CandidateNewRow = {
        id: number
        name: string
        created_at: string | null
      }

      // Votes dari tabel voters (has_voted = true)
      const { data: voterRows } = await supabase
        .from('voters')
        .select('name, class, voted_for, voted_at')
        .eq('has_voted', true)
        .order('voted_at', { ascending: false })
        .limit(15)

      if (voterRows && voterRows.length > 0) {
        const voterRowsTyped = voterRows as VoterRow[]
        const ids = Array.from(
          new Set(
            voterRowsTyped
              .map((r) => r.voted_for)
              .filter((x): x is number => x != null)
          )
        )
        let candMap: Record<number, string> = {}
        if (ids.length > 0) {
          const { data: candRows } = await supabase
            .from('candidates')
            .select('id, name')
            .in('id', ids)
          const candRowsTyped = (candRows ?? []) as CandidateNameRow[]
          candMap = Object.fromEntries(candRowsTyped.map((c) => [c.id, c.name]))
        }
        for (const r of voterRowsTyped) {
          const nama = r.voted_for != null ? (candMap[r.voted_for] || String(r.voted_for)) : '-'
          items.push({ id: `vote-${r.name}-${r.voted_at}`, type: 'vote', message: `${r.name} (${r.class}) memilih ${nama}`, timestamp: r.voted_at || new Date().toISOString() })
        }
      }

      // Kandidat baru
      const { data: candNew } = await supabase
        .from('candidates')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      for (const c of ((candNew ?? []) as CandidateNewRow[])) {
        items.push({ id: `cand-${c.id}`, type: 'candidate_added', message: `Kandidat baru: ${c.name}`, timestamp: c.created_at || new Date().toISOString() })
      }

      // Urutkan dan ambil 10 terbaru
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(items.slice(0, 10))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin || isPanitia) {
      fetchRecentActivity()
      const ch1 = supabase
        .channel('ra-voters')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => fetchRecentActivity())
        .subscribe()
      const ch2 = supabase
        .channel('ra-candidates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => fetchRecentActivity())
        .subscribe()
      return () => { try { supabase.removeChannel(ch1); supabase.removeChannel(ch2) } catch {} }
    }
  }, [isAdmin, isPanitia, fetchRecentActivity])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote':
        return <IconBallpen className="h-5 w-5 text-blue-500" />
      case 'user_added':
        return <IconUser className="h-5 w-5 text-green-500" />
      case 'candidate_added':
        return <IconPlus className="h-5 w-5 text-purple-500" />
      case 'election_updated':
        return <IconSettings className="h-5 w-5 text-orange-500" />
      default:
        return <IconBallpen className="h-5 w-5 text-gray-500" />
    }
  }

  if (!isAdmin && !isPanitia) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm border-0 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-sm font-medium mb-1">Belum ada aktivitas</div>
            <div className="text-xs">Aktivitas akan muncul di sini</div>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y rounded-md border">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/50 hover:bg-gray-50">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(activity.timestamp).toLocaleString('id-ID', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
