"use client"

import * as React from "react"
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
  IconUsers,
  IconUserPlus,
  IconBallpen,
  IconChartPie,
  IconUser,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
    ]

    // Admin menu - akses penuh
    if (user?.role === 'admin') {
      baseItems.push(
        {
          title: "Kelola Kandidat",
          url: "/dashboard/kelola-kandidat",
          icon: IconUsers,
        },
        {
          title: "Daftar Pemilih",
          url: "/dashboard/daftar-pemilih",
          icon: IconUser,
        },
        
        {
          title: "Hasil Pemilihan",
          url: "/dashboard/hasil-pemilihan",
          icon: IconChartPie,
        }
      )
    }

    // Panitia menu - kelola kandidat dan pemilihan
    if (user?.role === 'panitia') {
      baseItems.push(
        {
          title: "Kelola Kandidat",
          url: "/dashboard/kelola-kandidat",
          icon: IconUsers,
        },
        {
          title: "Daftar Pemilih",
          url: "/dashboard/daftar-pemilih",
          icon: IconUser,
        },
        
        {
          title: "Hasil Pemilihan",
          url: "/dashboard/hasil-pemilihan",
          icon: IconChartPie,
        }
      )
    }

    // Member menu - voting dan hasil pemilihan
    if (user?.role === 'member') {
      baseItems.push(
        {
          title: "Pilih Kandidat",
          url: "/dashboard/pilih-kandidat",
          icon: IconBallpen,
        },
        {
          title: "Hasil Pemilihan",
          url: "/dashboard/hasil-pemilihan-member",
          icon: IconChartPie,
        }
      )
    }

    // Common menu for all roles
    baseItems.push(
      {
        title: "Profil Kandidat",
        url: "/dashboard/profil-kandidat",
        icon: IconUser,
      }
    )

    return baseItems
  }

  const navSecondary = [
    {
      title: "Bantuan",
      url: "/dashboard/bantuan",
      icon: IconHelp,
    },
  ]

  const data = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: "/avatars/user.jpg",
    },
    navMain: getNavItems(),
    navSecondary,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Pemilihan OSIS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}