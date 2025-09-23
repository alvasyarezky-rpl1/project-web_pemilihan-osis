"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBallpen, IconUsers, IconShield, IconChartBar } from "@tabler/icons-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <IconBallpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Sistem Pemilihan Ketua OSIS
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform digital modern untuk pemilihan ketua OSIS yang transparan, 
            aman, dan mudah digunakan.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <IconShield className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Aman & Transparan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sistem keamanan tinggi dengan enkripsi data dan transparansi penuh 
                dalam proses pemilihan.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <IconUsers className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Multi-Role System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Dukungan untuk tiga role: Admin, Panitia, dan Member dengan 
                akses dan fitur yang sesuai.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <IconChartBar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>Analisis Real-time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Dashboard lengkap dengan statistik real-time dan visualisasi 
                hasil pemilihan yang interaktif.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Masuk ke Sistem</CardTitle>
              <p className="text-sm text-gray-600">
                Gunakan akun yang telah diberikan untuk mengakses sistem
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => router.push("/login")}
              >
                <IconBallpen className="mr-2 h-5 w-5" />
                Masuk Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 Sistem Pemilihan Ketua OSIS. Dibuat dengan Next.js & Supabase.</p>
        </div>
      </div>
    </div>
  )
}