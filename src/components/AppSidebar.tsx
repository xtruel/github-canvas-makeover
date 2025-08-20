import { Home, Map, Calendar, Users, Trophy, Settings } from "lucide-react"
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

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Mappa", url: "/mappa", icon: Map },
  { title: "Eventi", url: "/eventi", icon: Calendar },
  { title: "Community", url: "/community", icon: Users },
  { title: "Trofei", url: "/trofei", icon: Trophy },
  { title: "Impostazioni", url: "/impostazioni", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/20 text-roma-gold font-medium border-l-2 border-roma-gold" : "text-roma-yellow/80 hover:bg-muted/50 hover:text-roma-gold"

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end text-roma-gold" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-roma-gold font-semibold">
            Ovunque Romanisti
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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