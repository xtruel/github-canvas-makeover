import { Home, Map, Calendar, Users, Trophy, Settings, MessageCircle, FileText, Info, Upload } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

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

const baseItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Mappa", url: "/mappa", icon: Map },
  { title: "Eventi", url: "/eventi", icon: Calendar },
  { title: "Community", url: "/community", icon: Users },
  { title: "Forum", url: "/forum", icon: MessageCircle },
  { title: "Articoli", url: "/articles", icon: FileText },
  { title: "Info Forum", url: "/about-forum", icon: Info },
]

const adminItems = [
  { title: "Carica Post", url: "/upload", icon: Upload },
]

const settingsItems = [
  { title: "Trofei", url: "/trofei", icon: Trophy },
  { title: "Impostazioni", url: "/impostazioni", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { user } = useAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"

  // Combine items based on user role
  const allItems = [
    ...baseItems,
    ...(user?.role === 'ADMIN' ? adminItems : []),
    ...settingsItems
  ]

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background border-sidebar-border">
      <SidebarTrigger className="m-2 self-end text-sidebar-foreground" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-semibold">
            Ovunque Romanisti
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
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