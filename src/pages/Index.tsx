import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  console.log("INDEX COMPONENT IS LOADING!");
  console.log("Current time:", new Date().toLocaleTimeString());
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FF0000', 
      color: '#FFFF00', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontFamily: 'Arial'
    }}>
      <div style={{ textAlign: 'center', border: '3px solid yellow', padding: '50px' }}>
        <h1>🔴 ROMA TEST 🟡</h1>
        <p>Time: {new Date().toLocaleTimeString()}</p>
        <p>If you see this, the component is working!</p>
      </div>
    </div>
  );
};

export default Index;
