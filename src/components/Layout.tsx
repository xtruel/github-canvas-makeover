import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-16 flex items-center bg-[hsl(var(--roma-red))] text-white shadow-roma">
            <SidebarTrigger className="ml-4 text-white hover:text-[hsl(var(--roma-gold))]" />
            <h1 className="ml-4 text-xl font-bold uppercase tracking-wide">
              Ovunque Romanisti
            </h1>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}