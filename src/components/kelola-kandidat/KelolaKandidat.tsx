"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase, Candidate, DEMO_MODE } from "@/lib/supabase"
import { useCandidates } from "@/contexts/CandidateContext"
import { IconPlus, IconEdit, IconTrash, IconSearch, IconPhoto } from "@tabler/icons-react"
import { toast } from "sonner"
import Image from "next/image"

export function KelolaKandidat() {
  const { candidates, loading, refreshCandidates } = useCandidates()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    photo_url: "",
    vision: "",
    mission: "",
  })
  const [isDragging, setIsDragging] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('💾 Submitting candidate data:', formData)
      
      // Production mode - save to database
      if (DEMO_MODE) {
        // Demo mode - simulasi penyimpanan
        if (editingCandidate) {
          toast.success('Kandidat berhasil diperbarui (Demo Mode)')
        } else {
          toast.success('Kandidat berhasil ditambahkan (Demo Mode)')
        }
        setShowForm(false)
        setEditingCandidate(null)
        setFormData({ name: "", class: "", photo_url: "", vision: "", mission: "" })
        return
      }

      if (editingCandidate) {
        // Update existing candidate
        console.log('🔄 Updating candidate:', editingCandidate.id)
        const { data, error } = await supabase
          .from('candidates')
          .update({
            name: formData.name.trim(),
            class: formData.class.trim() || null,
            photo_url: formData.photo_url.trim() || null,
            vision: formData.vision.trim() || null,
            mission: formData.mission.trim() || null,
          })
          .eq('id', editingCandidate.id)
          .select()

        console.log('📊 Update response:', { data, error })
        if (error) throw error
        toast.success('Kandidat berhasil diperbarui')
      } else {
        // Create new candidate
        console.log('➕ Creating new candidate')
        const { data, error } = await supabase
          .from('candidates')
          .insert({
            name: formData.name.trim(),
            class: formData.class.trim() || null,
            photo_url: formData.photo_url.trim() || null,
            vision: formData.vision.trim() || null,
            mission: formData.mission.trim() || null,
          })

        console.log('📊 Insert response:', { data, error })
        if (error) throw error
        toast.success('Kandidat berhasil ditambahkan')
      }

      setShowForm(false)
      setEditingCandidate(null)
      setFormData({ name: "", class: "", photo_url: "", vision: "", mission: "" })
      await refreshCandidates()
    } catch (error: unknown) {
      console.error('❌ Error saving candidate:', error)
      toast.error((error as Error).message || 'Gagal menyimpan kandidat')
    }
  }

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setFormData({
      name: candidate.name,
      class: candidate.class || "",
      photo_url: candidate.photo_url || "",
      vision: candidate.vision || "",
      mission: candidate.mission || "",
    })
    setShowForm(true)
  }

  async function uploadPhotoToStorage(file: File): Promise<string> {
    if (DEMO_MODE) {
      // Demo mode: skip remote upload, use local preview URL
      return URL.createObjectURL(file)
    }
    const path = `candidates/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('candidate-photos')
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('candidate-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    try {
      const url = await uploadPhotoToStorage(file)
      setFormData(prev => ({ ...prev, photo_url: url }))
      toast.success('Foto berhasil diunggah')
    } catch (e) {
      console.error('upload candidate photo error', e)
      toast.error('Gagal mengunggah foto')
    }
  }

  const handleDelete = async (candidateId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) return

    try {
      // Production mode - hapus dari database
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId)

      if (error) throw error
      toast.success('Kandidat berhasil dihapus')
      await refreshCandidates()
    } catch (error) {
      console.error('Error deleting candidate:', error)
      toast.error('Gagal menghapus kandidat')
    }
  }

  const filteredCandidates = candidates.filter(candidate =>
    (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kelola Kandidat</h1>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Kandidat</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              if (!confirm('Hapus semua baris kandidat kosong (tanpa nama)?')) return
              try {
                // Hapus kandidat dengan name = ''
                const { error: e1 } = await supabase
                  .from('candidates')
                  .delete()
                  .eq('name', '')
                if (e1) throw e1

                // Hapus kandidat dengan name IS NULL
                const { error: e2 } = await supabase
                  .from('candidates')
                  .delete()
                  .is('name', null)
                if (e2) throw e2

                toast.success('Baris kandidat kosong berhasil dihapus')
                await refreshCandidates()
              } catch (err) {
                console.error('cleanup empty candidates error', err)
                toast.error('Gagal menghapus baris kandidat kosong')
              }
            }}
          >
            Bersihkan Kandidat Kosong
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Tambah Kandidat
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari kandidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama Kandidat</Label>
                  <Input
                    id="nama"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kelas">Kelas (opsional)</Label>
                  <Input
                    id="kelas"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="XI RPL 1"
                  />
                </div>
                <div>
                  <Label htmlFor="foto_url">URL Foto</Label>
                  <Input
                    id="foto_url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
                className={`border-2 border-dashed rounded-md p-4 text-sm ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">Upload Foto Kandidat</div>
                    <div className="text-muted-foreground">Tarik & lepas gambar di sini, atau pilih file</div>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="w-auto"
                  />
                </div>
                {formData.photo_url && (
                  <div className="mt-3">
                    <Image src={formData.photo_url} alt="Preview" width={120} height={120} className="rounded-md object-cover" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="visi">Visi</Label>
                <Textarea
                  id="visi"
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  placeholder="Masukkan visi kandidat..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="misi">Misi</Label>
                <Textarea
                  id="misi"
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  placeholder="Masukkan misi kandidat..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCandidate ? 'Perbarui' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCandidate(null)
                    setFormData({ name: "", class: "", photo_url: "", vision: "", mission: "" })
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{candidate.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(candidate)}
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(candidate.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo */}
              <div className="flex justify-center">
                {candidate.photo_url ? (
                  <Image
                    src={candidate.photo_url}
                    alt={candidate.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center">
                    <IconPhoto className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Vision */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Visi</h4>
                <p className="text-sm line-clamp-3">{candidate.vision}</p>
              </div>

              {/* Mission */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Misi</h4>
                <p className="text-sm line-clamp-3">{candidate.mission}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                Dibuat: {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('id-ID') : '-'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {searchTerm ? 'Tidak ada kandidat ditemukan' : 'Belum ada kandidat'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
