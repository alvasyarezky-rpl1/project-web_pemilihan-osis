"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { 
  IconUserPlus, 
  IconCalendar, 
  IconChartBar, 
  IconUsers, 
  IconBallpen, 
  IconEye,
  IconCheck
} from "@tabler/icons-react"

export function QuickActions() {
  const { isAdmin, isPanitia, isMember } = useAuth()
  const router = useRouter()

  // Remove Admin quick actions card per request
  if (isAdmin) return null

  // Remove Panitia quick actions card per request
  if (isPanitia) return null

  if (isMember) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-white shadow-sm border-l-4 border-l-blue-500 rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-blue-900">Aksi Cepat - Member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <Button 
            variant="default" 
            className="w-full justify-start h-10 text-left bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/pilih-kandidat')}
          >
            <IconBallpen className="mr-2 h-4 w-4 text-white" />
            <span className="text-xs font-medium text-white">Mulai Memilih</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-blue-50 border-blue-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/profil-kandidat')}
          >
            <IconUsers className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Profil Kandidat</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
