import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Trophy, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import romaLogo from "@/assets/roma-logo.png";

const Index = () => {
  const features = [
    {
      title: "Mappa Romanisti",
      description: "Trova altri tifosi della Roma nella tua zona",
      icon: MapPin,
      link: "/mappa",
      color: "text-roma-gold"
    },
    {
      title: "Eventi",
      description: "Scopri raduni e partite da guardare insieme",
      icon: Calendar,
      link: "/eventi",
      color: "text-roma-yellow"
    },
    {
      title: "Community",
      description: "Discuti e condividi la passione giallorossa",
      icon: MessageCircle,
      link: "/community",  
      color: "text-roma-gold"
    },
    {
      title: "Trofei",
      description: "Celebra la storia gloriosa della Roma",
      icon: Trophy,
      link: "/trofei",
      color: "text-roma-yellow"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-roma-gold to-roma-yellow bg-clip-text text-transparent">
          Ovunque Romanisti
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          La community globale dei tifosi giallorossi
        </p>
        <div className="mb-6">
          <img 
            src={romaLogo} 
            alt="AS Roma Logo" 
            className="w-24 h-24 mx-auto object-contain"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
              <CardTitle className="text-roma-gold">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full shadow-roma">
                <Link to={feature.link}>Esplora</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <Card className="shadow-roma border-border/50 bg-gradient-to-r from-roma-red/10 to-roma-gold/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-roma-gold mb-4">Forza Roma Sempre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-roma-gold">1927</div>
              <div className="text-muted-foreground">Fondata</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-roma-yellow">3</div>
              <div className="text-muted-foreground">Scudetti</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-roma-gold">∞</div>
              <div className="text-muted-foreground">Passione</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
