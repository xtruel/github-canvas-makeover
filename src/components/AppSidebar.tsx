import { Home, Map, Calendar, Users, Trophy, Settings, FileText, Upload, Lock } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

const baseItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Mappa", url: "/mappa", icon: Map },
  { title: "Eventi", url: "/eventi", icon: Calendar },
  { title: "Community", url: "/community", icon: Users },
  { title: "Articoli", url: "/articles", icon: FileText },
  { title: "Trofei", url: "/trofei", icon: Trophy },
  { title: "Impostazioni", url: "/impostazioni", icon: Settings },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const { role } = useAuth()

  const items = [...baseItems]
  if (role === 'ADMIN') {
    items.splice(5, 0, { title: "Carica Post", url: "/upload", icon: Upload })
  }

  function getNavCls(path: string) {
    const active = location.pathname === path
    return [
      "w-full justify-start",
      active ? "bg-roma-gold/20 text-roma-gold" : "hover:bg-roma-gold/10"
    ].join(" ")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavCls(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}