import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="ml-4 text-roma-gold hover:text-roma-yellow" />
            <h1 className="ml-4 text-xl font-bold text-roma-gold">Ovunque Romanisti</h1>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}