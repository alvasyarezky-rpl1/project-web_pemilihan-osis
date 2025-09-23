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

      // Votes dari tabel voters (has_voted = true)
      const { data: voterRows } = await supabase
        .from('voters')
        .select('name, class, voted_for, voted_at')
        .eq('has_voted', true)
        .order('voted_at', { ascending: false })
        .limit(15)

      if (voterRows && voterRows.length > 0) {
        const ids = Array.from(new Set(voterRows.map((r: any) => r.voted_for).filter((x: any) => x != null)))
        let candMap: Record<number, string> = {}
        if (ids.length > 0) {
          const { data: candRows } = await supabase
            .from('candidates')
            .select('id, name')
            .in('id', ids)
          candMap = Object.fromEntries((candRows || []).map((c: any) => [c.id, c.name]))
        }
        for (const r of voterRows as any[]) {
          const nama = candMap[r.voted_for] || String(r.voted_for)
          items.push({ id: `vote-${r.name}-${r.voted_at}`, type: 'vote', message: `${r.name} (${r.class}) memilih ${nama}`, timestamp: r.voted_at || new Date().toISOString() })
        }
      }

      // Kandidat baru
      const { data: candNew } = await supabase
        .from('candidates')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      for (const c of (candNew || []) as any[]) {
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
  }, [isAdmin])

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
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-lg font-medium mb-2">Belum ada aktivitas</div>
            <div className="text-sm">Aktivitas akan muncul di sini</div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-foreground font-medium leading-relaxed">
                    {activity.message}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
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
