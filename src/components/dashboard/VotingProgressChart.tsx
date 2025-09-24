                    "use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell } from "recharts"
import { IconChartPie } from "@tabler/icons-react"

interface VotingProgressData {
  voted: number
  notVoted: number
  total: number
}

const chartConfig = {
  voted: {
    label: "Sudah Memilih",
    color: "hsl(var(--chart-1))",
  },
  notVoted: {
    label: "Belum Memilih", 
    color: "hsl(var(--chart-2))",
  },
}

export function VotingProgressChart() {
  const { isMember } = useAuth()
  const [data, setData] = useState<VotingProgressData>({
    voted: 0,
    notVoted: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMember) {
      fetchVotingProgress()
    }
  }, [isMember])

  // Realtime update: refresh progress whenever voters table changes (new schema)
  useEffect(() => {
    if (!isMember) return
    const channel = supabase
      .channel('voters-progress-member')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => {
        fetchVotingProgress()
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [isMember])

  const fetchVotingProgress = async () => {
    try {
      // Total voters = semua baris di voters
      const [{ count: totalVoters }, { count: votedCount }] = await Promise.all([
        supabase.from('voters').select('*', { count: 'exact', head: true }),
        supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true),
      ])

      const total = totalVoters || 0
      const voted = votedCount || 0
      const notVoted = total > voted ? total - voted : 0

      setData({ voted, notVoted, total })
    } catch (error) {
      console.error('Error fetching voting progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isMember || loading) {
    return null
  }

  const chartData = [
    {
      name: "voted",
      value: data.voted,
      fill: "var(--color-voted)",
    },
    {
      name: "notVoted", 
      value: data.notVoted,
      fill: "var(--color-notVoted)",
    },
  ]

  const votedPercentage = data.total > 0 ? Math.round((data.voted / data.total) * 100) : 0

  return (
    <Card className="bg-white shadow-sm border-0 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <IconChartPie className="h-4 w-4 text-blue-600" />
          Progress Pemilihan
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-3">
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="h-32 w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => [
                      `${value} orang`,
                      chartConfig[name as keyof typeof chartConfig]?.label || name,
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={20}
                outerRadius={50}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Progress Info */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Progress:</span>
              <span className="font-semibold text-gray-900">{votedPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sudah Memilih:</span>
              <span className="text-gray-900">{data.voted} orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Belum Memilih:</span>
              <span className="text-gray-900">{data.notVoted} orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Pemilih:</span>
              <span className="font-medium text-gray-900">{data.total} orang</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
