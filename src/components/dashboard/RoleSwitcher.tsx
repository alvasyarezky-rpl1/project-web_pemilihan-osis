"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconChevronDown, IconShield, IconUsers, IconUser } from "@tabler/icons-react"

export function RoleSwitcher() {
  const { user, switchRole } = useAuth()

  const roles = [
    {
      value: 'admin',
      label: 'Administrator',
      icon: IconShield,
      description: 'Akses penuh ke semua fitur'
    },
    {
      value: 'panitia',
      label: 'Panitia',
      icon: IconUsers,
      description: 'Kelola kandidat dan pemilihan'
    },
    {
      value: 'member',
      label: 'Anggota',
      icon: IconUser,
      description: 'Hanya dapat memilih kandidat'
    }
  ]

  const currentRole = roles.find(role => role.value === user?.role)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Role saat ini:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {currentRole && <currentRole.icon className="h-4 w-4" />}
            {currentRole?.label}
            <IconChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {roles.map((role) => (
            <DropdownMenuItem
              key={role.value}
              onClick={() => switchRole(role.value as 'admin' | 'panitia' | 'member')}
              className="flex items-start gap-3 p-3"
            >
              <role.icon className="h-4 w-4 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium">{role.label}</span>
                <span className="text-xs text-muted-foreground">{role.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
