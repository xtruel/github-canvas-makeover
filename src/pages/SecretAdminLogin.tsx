import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const SecretAdminLogin = () => {
  const { role, loginAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (role === 'ADMIN') {
    return <Navigate to="/upload" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginAdmin(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Errore di autenticazione');
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Card className="shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-roma-gold">
            <Lock className="h-5 w-5" /> Area Riservata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Accesso in corso...' : 'Entra'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Pagina non indicizzata e accessibile solo con link diretto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretAdminLogin;