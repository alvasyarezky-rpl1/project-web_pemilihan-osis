"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { IconBallpen, IconCheck, IconClock } from "@tabler/icons-react"

interface VotingStatusData {
  hasVoted: boolean
  electionStatus: 'upcoming' | 'active' | 'ended'
  electionInfo: {
    start_date: string
    end_date: string
  } | null
}

export function VotingStatus() {
  const { isMember } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<VotingStatusData>({
    hasVoted: false,
    electionStatus: 'upcoming',
    electionInfo: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMember) {
      fetchVotingStatus()
    }
  }, [isMember])

  const fetchVotingStatus = async () => {
    try {
      // Gunakan data mock untuk demo UI
      const mockStatus: VotingStatusData = {
        hasVoted: false,
        electionStatus: 'upcoming',
        electionInfo: {
          start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week
        }
      }

      setStatus(mockStatus)
    } catch (error) {
      console.error('Error fetching voting status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isMember || loading) {
    return null
  }

  const getStatusBadge = () => {
    if (status.hasVoted) {
      return <Badge variant="default" className="bg-green-500">Sudah Memilih</Badge>
    }
    
    switch (status.electionStatus) {
      case 'upcoming':
        return <Badge variant="secondary">Belum Dimulai</Badge>
      case 'active':
        return <Badge variant="destructive">Belum Memilih</Badge>
      case 'ended':
        return <Badge variant="outline">Pemilihan Berakhir</Badge>
      default:
        return <Badge variant="outline">Tidak Ada Pemilihan</Badge>
    }
  }

  const getStatusIcon = () => {
    if (status.hasVoted) {
      return <IconCheck className="h-5 w-5 text-green-500" />
    }
    
    switch (status.electionStatus) {
      case 'upcoming':
        return <IconClock className="h-5 w-5 text-yellow-500" />
      case 'active':
        return <IconBallpen className="h-5 w-5 text-red-500" />
      case 'ended':
        return <IconClock className="h-5 w-5 text-gray-500" />
      default:
        return <IconClock className="h-5 w-5 text-gray-500" />
    }
  }

  const canVote = status.electionStatus === 'active' && !status.hasVoted

  return (
    <Card className="bg-white shadow-sm border-0 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {getStatusIcon()}
          Status Pemilihan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Status Anda:</span>
          {getStatusBadge()}
        </div>
        
        {status.electionInfo && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Tanggal Mulai:</span>
              <span className="text-gray-900">{new Date(status.electionInfo.start_date).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tanggal Berakhir:</span>
              <span className="text-gray-900">{new Date(status.electionInfo.end_date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        )}
        
        {canVote && (
          <Button 
            className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/pilih-kandidat')}
          >
            <IconBallpen className="mr-2 h-3 w-3" />
            Mulai Memilih
          </Button>
        )}
        
        {status.hasVoted && (
          <div className="text-center text-xs text-gray-500">
            Terima kasih! Anda telah berpartisipasi dalam pemilihan.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
