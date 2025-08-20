import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-yellow-400">Ovunque Romanisti</h1>
        <p className="text-xl text-yellow-200">La comunità globale dei tifosi della AS Roma</p>
        <div className="mt-8">
          <button className="bg-yellow-400 text-red-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300">
            Entra nella Comunità
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
