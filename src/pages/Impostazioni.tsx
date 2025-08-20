import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bell, Shield } from "lucide-react";

const Impostazioni = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Impostazioni
      </h1>
      
      <div className="grid gap-6 max-w-2xl">
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <User className="h-5 w-5" />
              Profilo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-roma-yellow/80">Nome utente</label>
              <input 
                type="text" 
                className="w-full p-2 bg-muted border border-border rounded-md text-foreground"
                placeholder="Il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-roma-yellow/80">Email</label>
              <input 
                type="email" 
                className="w-full p-2 bg-muted border border-border rounded-md text-foreground"
                placeholder="tua@email.com"
              />
            </div>
            <Button className="shadow-roma">Aggiorna Profilo</Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notifiche eventi</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notifiche partite</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Messaggi community</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profilo pubblico</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mostra posizione</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Condividi eventi</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Impostazioni;