"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { IconBell, IconCheck, IconX, IconCalendar, IconUsers, IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"

interface Notification {
  id: string
  role_target: 'admin' | 'panitia' | 'member' | 'all'
  title: string
  message: string
  type: 'event_created' | 'event_approved' | 'event_rejected' | 'event_started' | 'event_completed' | 'vote_reminder' | 'election_activated' | 'election_deactivated' | 'election_reminder' | 'vote_received' | 'vote_duplicate_blocked' | 'system_announcement' | 'maintenance_info'
  is_read: boolean
  created_at: string
  event_id?: string
}

export function NotificationSystem() {
  const { user, isAdmin, isPanitia, isMember } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const targetRole = isAdmin ? 'admin' : isPanitia ? 'panitia' : isMember ? 'member' : 'member'
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('role_target', [targetRole, 'all'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Tanpa login: tandai read hanya di client (tidak update user_id)
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
      if (unreadIds.length === 0) return
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('Semua notifikasi telah dibaca')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Gagal menandai semua notifikasi sebagai dibaca')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_created':
        return <IconCalendar className="h-4 w-4 text-blue-600" />
      case 'event_approved':
        return <IconCheck className="h-4 w-4 text-green-600" />
      case 'event_rejected':
        return <IconX className="h-4 w-4 text-red-600" />
      case 'event_started':
        return <IconUsers className="h-4 w-4 text-blue-600" />
      case 'event_completed':
        return <IconCalendar className="h-4 w-4 text-gray-600" />
      case 'vote_reminder':
        return <IconAlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <IconBell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event_created':
        return 'border-blue-200 bg-blue-50'
      case 'event_approved':
        return 'border-green-200 bg-green-50'
      case 'event_rejected':
        return 'border-red-200 bg-red-50'
      case 'event_started':
        return 'border-blue-200 bg-blue-50'
      case 'event_completed':
        return 'border-gray-200 bg-gray-50'
      case 'vote_reminder':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getRoleSpecificNotifications = () => {
    if (isAdmin) {
      return notifications.filter(n => 
        ['event_created', 'event_approved', 'event_rejected'].includes(n.type)
      )
    } else if (isPanitia) {
      return notifications.filter(n => 
        ['event_approved', 'event_rejected', 'event_started', 'event_completed'].includes(n.type)
      )
    } else if (isMember) {
      return notifications.filter(n => 
        ['event_started', 'vote_reminder'].includes(n.type)
      )
    }
    return notifications
  }

  const roleNotifications = getRoleSpecificNotifications()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Card className="bg-white shadow-sm border-0 rounded-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <IconBell className="h-4 w-4 text-blue-600" />
            Notifikasi
          </CardTitle>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {unreadCount} baru
              </Badge>
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Tandai Semua Dibaca
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {roleNotifications.length === 0 ? (
            <div className="text-center py-4">
              <IconBell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            roleNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border ${getNotificationColor(notification.type)} ${
                  !notification.is_read ? 'ring-2 ring-blue-200' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {roleNotifications.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-gray-600 hover:text-gray-900"
              onClick={() => {
                // Navigate to full notifications page
                console.log('Navigate to notifications page')
              }}
            >
              Lihat Semua Notifikasi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
