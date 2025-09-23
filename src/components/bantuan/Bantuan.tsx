"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { IconHelp, IconUser, IconUsers, IconBallpen, IconSettings, IconChartBar } from "@tabler/icons-react"

export function Bantuan() {
  const { isAdmin, isPanitia, isMember } = useAuth()

  const adminHelp = [
    {
      title: "Dashboard",
      description: "Lihat statistik pemilihan, jumlah kandidat, pemilih terdaftar, dan aktivitas terbaru.",
      features: [
        "Statistik real-time pemilihan",
        "Aksi cepat untuk manajemen",
        "Aktivitas terbaru sistem"
      ]
    },
    {
      title: "Kelola Pengguna",
      description: "Tambah, edit, dan hapus pengguna sistem. Kelola role admin, panitia, dan member.",
      features: [
        "Tambah pengguna baru",
        "Edit informasi pengguna",
        "Hapus pengguna",
        "Kelola role dan izin"
      ]
    },
    {
      title: "Kelola Kandidat",
      description: "Tambah, edit, dan hapus kandidat pemilihan ketua OSIS.",
      features: [
        "Tambah kandidat baru",
        "Upload foto kandidat",
        "Tulis visi dan misi",
        "Edit informasi kandidat"
      ]
    },
    {
      title: "Pengaturan Acara",
      description: "Atur jadwal pemilihan, aktifkan/nonaktifkan pemilihan.",
      features: [
        "Set tanggal mulai dan berakhir",
        "Aktifkan/nonaktifkan pemilihan",
        "Monitor status pemilihan"
      ]
    },
    {
      title: "Hasil Pemilihan",
      description: "Lihat hasil pemilihan dalam bentuk grafik dan statistik detail.",
      features: [
        "Grafik batang dan pie chart",
        "Statistik detail per kandidat",
        "Tingkat partisipasi pemilih",
        "Export hasil pemilihan"
      ]
    }
  ]

  const panitiaHelp = [
    {
      title: "Dashboard",
      description: "Lihat statistik pemilihan dan aktivitas terbaru.",
      features: [
        "Statistik real-time pemilihan",
        "Aksi cepat untuk panitia",
        "Aktivitas terbaru sistem"
      ]
    },
    {
      title: "Kelola Kandidat",
      description: "Tambah, edit, dan hapus kandidat pemilihan ketua OSIS.",
      features: [
        "Tambah kandidat baru",
        "Upload foto kandidat",
        "Tulis visi dan misi",
        "Edit informasi kandidat"
      ]
    },
    {
      title: "Pengaturan Acara",
      description: "Atur jadwal pemilihan, aktifkan/nonaktifkan pemilihan.",
      features: [
        "Set tanggal mulai dan berakhir",
        "Aktifkan/nonaktifkan pemilihan",
        "Monitor status pemilihan"
      ]
    },
    {
      title: "Hasil Pemilihan",
      description: "Lihat hasil pemilihan dalam bentuk grafik dan statistik detail.",
      features: [
        "Grafik batang dan pie chart",
        "Statistik detail per kandidat",
        "Tingkat partisipasi pemilih"
      ]
    }
  ]

  const memberHelp = [
    {
      title: "Dashboard",
      description: "Lihat status pemilihan dan informasi penting.",
      features: [
        "Status voting Anda",
        "Informasi periode pemilihan",
        "Tombol aksi cepat"
      ]
    },
    {
      title: "Pilih Kandidat",
      description: "Pilih kandidat yang menurut Anda paling tepat untuk menjadi ketua OSIS.",
      features: [
        "Lihat daftar kandidat",
        "Baca visi dan misi",
        "Pilih kandidat favorit",
        "Konfirmasi pilihan"
      ]
    },
    {
      title: "Profil Kandidat",
      description: "Lihat profil lengkap semua kandidat pemilihan.",
      features: [
        "Foto kandidat",
        "Visi dan misi lengkap",
        "Informasi kandidat"
      ]
    }
  ]

  const getHelpContent = () => {
    if (isAdmin) return adminHelp
    if (isPanitia) return panitiaHelp
    if (isMember) return memberHelp
    return []
  }

  const getRoleIcon = () => {
    if (isAdmin) return <IconUser className="h-5 w-5" />
    if (isPanitia) return <IconUsers className="h-5 w-5" />
    if (isMember) return <IconBallpen className="h-5 w-5" />
    return <IconHelp className="h-5 w-5" />
  }

  const getRoleName = () => {
    if (isAdmin) return "Admin"
    if (isPanitia) return "Panitia"
    if (isMember) return "Member"
    return "User"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Bantuan</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          {getRoleIcon()}
          {getRoleName()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Penggunaan Sistem Pemilihan Ketua OSIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Selamat datang di sistem pemilihan ketua OSIS! Berikut adalah panduan lengkap 
            untuk menggunakan sistem sesuai dengan role Anda.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Role Anda: {getRoleName()}</h3>
            <p className="text-sm text-blue-800">
              {isAdmin && "Sebagai admin, Anda memiliki akses penuh untuk mengelola seluruh sistem pemilihan."}
              {isPanitia && "Sebagai panitia, Anda dapat mengelola kandidat, pengaturan Acara, dan melihat hasil."}
              {isMember && "Sebagai member, Anda dapat memilih kandidat dan melihat profil kandidat."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="space-y-6">
        {getHelpContent().map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.title === "Dashboard" && <IconChartBar className="h-5 w-5" />}
                {section.title === "Kelola Pengguna" && <IconUser className="h-5 w-5" />}
                {section.title === "Kelola Kandidat" && <IconUsers className="h-5 w-5" />}
                {section.title === "Pengaturan Acara" && <IconSettings className="h-5 w-5" />}
                {section.title === "Hasil Pemilihan" && <IconChartBar className="h-5 w-5" />}
                {section.title === "Pilih Kandidat" && <IconBallpen className="h-5 w-5" />}
                {section.title === "Profil Kandidat" && <IconUsers className="h-5 w-5" />}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <div>
                <h4 className="font-semibold mb-2">Fitur yang tersedia:</h4>
                <ul className="space-y-1">
                  {section.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Help */}
      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Bagaimana cara memilih kandidat?</h4>
            <p className="text-sm text-muted-foreground">
              Pergi ke menu &quot;Pilih Kandidat&quot;, baca visi dan misi setiap kandidat, 
              lalu klik pada kandidat yang ingin Anda pilih dan konfirmasi pilihan Anda.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Apakah saya bisa mengubah pilihan setelah memilih?</h4>
            <p className="text-sm text-muted-foreground">
              Tidak, setelah Anda memilih kandidat, pilihan tidak dapat diubah. 
              Pastikan Anda sudah yakin dengan pilihan Anda sebelum mengkonfirmasi.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Kapan pemilihan berlangsung?</h4>
            <p className="text-sm text-muted-foreground">
              Jadwal pemilihan dapat dilihat di dashboard. Pemilihan hanya dapat dilakukan 
              dalam periode yang telah ditentukan oleh admin/panitia.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Bagaimana jika ada masalah teknis?</h4>
            <p className="text-sm text-muted-foreground">
              Jika Anda mengalami masalah teknis, silakan hubungi admin atau panitia 
              untuk mendapatkan bantuan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}