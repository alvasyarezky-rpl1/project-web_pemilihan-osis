"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher"
import { RoleGuard } from "@/components/RoleGuard"
import { useAuth } from "@/contexts/AuthContext"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

function DashboardContent() {
  const { isAdmin, isPanitia, isMember } = useAuth()

  // Role-specific grid layouts
  const renderGridLayout = () => {
    if (isMember) {
      // Member layout: Quick Actions only (remove status/progress/notifications)
      return (
        <div className="px-4 lg:px-6 grid gap-4 md:grid-cols-2 lg:grid-cols-16">
          {/* Quick Actions */}
          <div className="lg:col-span-5">
            <QuickActions />
          </div>
        </div>
      )
    } else if (isAdmin || isPanitia) {
      // Admin/Panitia layout: Quick Actions + Recent Activity (remove notifications)
      return (
        <div className="px-4 lg:px-6 grid gap-4 md:grid-cols-2 lg:grid-cols-16">
          {/* Quick Actions */}
          <div className="lg:col-span-5">
            <QuickActions />
          </div>
          
          {/* Recent Activity */}
          <div className="lg:col-span-6">
            <RecentActivity />
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Role Switcher */}
          <div className="px-4 lg:px-6 flex justify-end">
            <RoleSwitcher />
          </div>
          
          
          {/* Stats Cards */}
          <div className="px-4 lg:px-6">
            <StatsCards />
          </div>
          
          
          
          {/* Role-specific Main Content Grid */}
          {renderGridLayout()}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin', 'panitia', 'member']}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
