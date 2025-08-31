import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, UserCog } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, login, logout, loading } = useAuth();

  const handleDevLogin = async (role: 'USER' | 'ADMIN') => {
    const email = role === 'ADMIN' ? 'admin@roma.com' : 'user@roma.com';
    try {
      await login(email, role);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-4">
            <div className="flex items-center">
              <SidebarTrigger className="text-roma-gold hover:text-roma-yellow" />
              <h1 className="ml-4 text-xl font-bold text-roma-gold">Ovunque Romanisti</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-roma-gold border-t-transparent rounded-full" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    {user.role === 'ADMIN' ? <UserCog className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {user.email} ({user.role})
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDevLogin('USER')}>
                    Login User
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDevLogin('ADMIN')}>
                    Login Admin
                  </Button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}