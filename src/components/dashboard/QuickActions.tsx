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

  if (isAdmin) {
    return (
      <Card className="bg-white shadow-sm border-0 rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Aksi Cepat - Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/kelola-pengguna')}
          >
            <IconUserPlus className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Tambah Pengguna</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/pengaturan-pemilihan')}
          >
            <IconCalendar className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Atur Jadwal</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/hasil-pemilihan')}
          >
            <IconChartBar className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Lihat Laporan</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isPanitia) {
    return (
      <Card className="bg-white shadow-sm border-0 rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Aksi Cepat - Panitia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/kelola-pengguna')}
          >
            <IconCheck className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Verifikasi Pemilih</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/kelola-kandidat')}
          >
            <IconUsers className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Kelola Kandidat</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/hasil-pemilihan')}
          >
            <IconEye className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Pantau Hasil</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isMember) {
    return (
      <Card className="bg-white shadow-sm border-0 rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Aksi Cepat - Member</CardTitle>
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
            className="w-full justify-start h-10 text-left bg-white hover:bg-gray-50 border-gray-200 rounded-md shadow-none"
            onClick={() => router.push('/dashboard/profil-kandidat')}
          >
            <IconUsers className="mr-2 h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-900">Profil Kandidat</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
