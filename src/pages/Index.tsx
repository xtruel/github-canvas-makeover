import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#8B0000', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          TEST - Ovunque Romanisti
        </h1>
        <p style={{ fontSize: '20px' }}>
          Can you see this? Roma colors test!
        </p>
      </div>
    </div>
  );
};

export default Index;
