"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, User } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconCalendar, IconClock, IconUsers } from "@tabler/icons-react"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  created_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  creator_name?: string
  approver_name?: string
}

interface EventStats {
  total: number
  pending: number
  approved: number
  rejected: number
  active: number
  completed: number
}

export function EventsManagement() {
  const { user, isAdmin, isPanitia } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    completed: 0
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: ""
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const eventsWithNames = data || []

      setEvents(eventsWithNames)
      calculateStats(eventsWithNames)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Gagal memuat data acara')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (eventsData: Event[]) => {
    const stats = {
      total: eventsData.length,
      pending: eventsData.filter(e => e.status === 'pending').length,
      approved: eventsData.filter(e => e.status === 'approved').length,
      rejected: eventsData.filter(e => e.status === 'rejected').length,
      active: eventsData.filter(e => e.status === 'active').length,
      completed: eventsData.filter(e => e.status === 'completed').length
    }
    setStats(stats)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id)

        if (error) throw error
        toast.success('Acara berhasil diperbarui')
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            created_by: null,
            created_by_name: (isAdmin && 'Admin Guest') || (isPanitia && 'Panitia Guest') || 'Guest',
            status: 'pending'
          })

        if (error) throw error
        toast.success('Acara berhasil dibuat dan menunggu persetujuan admin')
      }

      setShowForm(false)
      setEditingEvent(null)
      setFormData({ title: "", description: "", start_date: "", end_date: "" })
      fetchEvents()
    } catch (error: unknown) {
      console.error('Error saving event:', error)
      toast.error((error as Error).message || 'Gagal menyimpan acara')
    }
  }

  const handleApprove = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'active',
          approved_by: null,
          approved_by_name: (isAdmin && 'Admin Guest') || (isPanitia && 'Panitia Guest') || 'Guest',
          approved_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error
      toast.success('Acara disetujui dan diaktifkan')
      fetchEvents()
    } catch (error) {
      console.error('Error approving event:', error)
      toast.error('Gagal menyetujui acara')
    }
  }

  // Admin only: set Active/Completed manually
  const handleSetActive = async (eventId: string) => {
    if (!isAdmin) return
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'active' })
        .eq('id', eventId)
      if (error) throw error
      toast.success('Acara diaktifkan')
      fetchEvents()
    } catch (error) {
      console.error('Error setting active:', error)
      toast.error('Gagal mengaktifkan acara')
    }
  }

  const handleSetCompleted = async (eventId: string) => {
    if (!isAdmin) return
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', eventId)
      if (error) throw error
      toast.success('Acara diselesaikan')
      fetchEvents()
    } catch (error) {
      console.error('Error completing event:', error)
      toast.error('Gagal menyelesaikan acara')
    }
  }

  const handleReject = async (eventId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'rejected',
          approved_by: null,
          approved_by_name: (isAdmin && 'Admin Guest') || (isPanitia && 'Panitia Guest') || 'Guest',
          approved_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', eventId)

      if (error) throw error
      toast.success('Acara berhasil ditolak')
      fetchEvents()
    } catch (error) {
      console.error('Error rejecting event:', error)
      toast.error('Gagal menolak acara')
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus acara ini?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      toast.success('Acara berhasil dihapus')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Gagal menghapus acara')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Menunggu' },
      approved: { color: 'bg-green-500', text: 'Disetujui' },
      rejected: { color: 'bg-red-500', text: 'Ditolak' },
      active: { color: 'bg-blue-500', text: 'Aktif' },
      completed: { color: 'bg-gray-500', text: 'Selesai' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>
  }

  const filteredEvents = (status: string) => {
    if (status === 'all') return events
    return events.filter(event => event.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconCalendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconClock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconX className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconUsers className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IconCalendar className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Acara Pemilihan</h2>
        {(isPanitia || isAdmin) && (
          <Button onClick={() => setShowForm(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Buat Acara Baru
          </Button>
        )}
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="pending">Menunggu</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'approved', 'rejected', 'active', 'completed'].map(status => (
          <TabsContent key={status} value={status}>
            <div className="grid gap-4">
              {filteredEvents(status).map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Dibuat oleh: {event.created_by_name || '—'} • {new Date(event.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(event.status)}
                        {isAdmin && event.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button size="sm" onClick={() => handleApprove(event.id)}>
                              <IconCheck className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              const reason = prompt('Alasan penolakan:')
                              if (reason) handleReject(event.id, reason)
                            }}>
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {isAdmin && event.status === 'approved' && (
                          <Button size="sm" onClick={() => handleSetActive(event.id)}>Aktifkan</Button>
                        )}
                        {isAdmin && event.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handleSetCompleted(event.id)}>Selesaikan</Button>
                        )}
                        {(isAdmin || (isPanitia && event.created_by === user?.id)) && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingEvent(event)
                            setFormData({
                              title: event.title,
                              description: event.description,
                              start_date: event.start_date.split('T')[0],
                              end_date: event.end_date.split('T')[0]
                            })
                            setShowForm(true)
                          }}>
                            <IconEdit className="h-4 w-4" />
                          </Button>
                        )}
                        {(isAdmin || (isPanitia && event.created_by === user?.id)) && (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tanggal Mulai:</span>
                        <p>{new Date(event.start_date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Tanggal Berakhir:</span>
                        <p>{new Date(event.end_date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    {event.approved_by_name && (
                      <div className="mt-4 text-sm">
                        <span className="font-medium">Disetujui oleh:</span> {event.approved_by_name} • {new Date(event.approved_at!).toLocaleDateString('id-ID')}
                      </div>
                    )}
                    {event.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <span className="font-medium text-red-800">Alasan Penolakan:</span>
                        <p className="text-red-700">{event.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {filteredEvents(status).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">Tidak ada acara dengan status "{status}"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingEvent ? 'Edit Acara' : 'Buat Acara Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Acara</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Pemilihan Ketua OSIS 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi acara pemilihan..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Tanggal Berakhir</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false)
                    setEditingEvent(null)
                    setFormData({ title: "", description: "", start_date: "", end_date: "" })
                  }}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingEvent ? 'Perbarui' : 'Buat Acara'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
