import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Image, 
  Video, 
  FileText, 
  Users, 
  Shield, 
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

const AboutForum = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Discussioni di Testo",
      description: "Condividi le tue opinioni, analisi tattiche e commenti sulle partite con altri tifosi romanisti.",
      color: "text-roma-gold"
    },
    {
      icon: Image,
      title: "Foto e Immagini",
      description: "Pubblica foto dallo stadio, momenti storici, meme divertenti e tutto ciò che riguarda la Roma.",
      color: "text-roma-yellow"
    },
    {
      icon: Video,
      title: "Video e Interviste",
      description: "Carica video dal vivo, interviste esclusive, highlights delle partite e contenuti multimediali.",
      color: "text-roma-red"
    },
    {
      icon: Users,
      title: "Community Attiva",
      description: "Entra a far parte di una community di oltre 50.000 tifosi romanisti da tutto il mondo.",
      color: "text-primary"
    }
  ];

  const guidelines = [
    {
      icon: CheckCircle,
      title: "Contenuti Consentiti",
      items: [
        "Discussioni su partite, tattiche e giocatori",
        "Foto e video dallo stadio o eventi Roma",
        "Notizie e aggiornamenti sulla squadra",
        "Meme e contenuti divertenti a tema Roma",
        "Organizzazione di raduni e eventi tifosi",
        "Analisi storiche e ricordi romanisti"
      ],
      color: "text-green-400"
    },
    {
      icon: AlertCircle,
      title: "Contenuti Non Consentiti",
      items: [
        "Insulti o linguaggio offensivo",
        "Spam o contenuti pubblicitari",
        "Contenuti off-topic non relativi alla Roma",
        "Fake news o informazioni false",
        "Contenuti protetti da copyright",
        "Incitamento all'odio o violenza"
      ],
      color: "text-red-400"
    }
  ];

  const stats = [
    { label: "Membri Registrati", value: "52,847", icon: Users },
    { label: "Post Pubblicati", value: "127,439", icon: MessageCircle },
    { label: "Foto Condivise", value: "18,234", icon: Image },
    { label: "Video Caricati", value: "3,456", icon: Video }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-roma-gold mb-4">
          Benvenuto nel Forum Romanisti
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Il punto di incontro digitale per tutti i tifosi giallorossi. 
          Condividi la tua passione, discuti di calcio e vivi la Roma insieme a migliaia di altri romanisti.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-glow border-border/50 text-center">
            <CardContent className="p-6">
              <stat.icon className="h-8 w-8 text-roma-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground text-center mb-8">
          Cosa Puoi Fare Nel Forum
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-roma border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-center">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {guidelines.map((section, index) => (
          <Card key={index} className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${section.color}`}>
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 ${section.color === 'text-green-400' ? 'bg-green-400' : 'bg-red-400'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to Post */}
      <Card className="shadow-roma border-border/50 mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-2">
            <Info className="h-6 w-6 text-roma-gold" />
            Come Pubblicare Contenuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-roma-gold rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Scegli il Tipo</h3>
              <p className="text-sm text-muted-foreground">
                Seleziona se vuoi pubblicare testo, immagini o video
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-roma-yellow rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">Crea il Contenuto</h3>
              <p className="text-sm text-muted-foreground">
                Scrivi il tuo post, carica i file e aggiungi tag appropriati
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-roma-red rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pubblica e Condividi</h3>
              <p className="text-sm text-muted-foreground">
                Il tuo post sarà visibile alla community per interagire
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Guidelines */}
      <Card className="shadow-glow border-border/50 mb-12">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Linee Guida per File e Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-roma-gold mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Immagini
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Formati supportati: JPG, PNG, GIF</li>
                <li>• Dimensione massima: 10 MB</li>
                <li>• Risoluzione consigliata: 1920x1080px</li>
                <li>• Evita immagini sfocate o di bassa qualità</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-roma-red mb-3 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Formati supportati: MP4, AVI, MOV</li>
                <li>• Dimensione massima: 50 MB</li>
                <li>• Durata massima: 5 minuti</li>
                <li>• Qualità minima: 720p</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="shadow-roma border-border/50 bg-gradient-roma">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pronto a Unirti alla Community?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Entra nel forum più grande d'Italia dedicato alla Roma. 
            Condividi la tua passione, fai nuove amicizie e vivi ogni emozione giallorossa insieme a noi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-roma-red hover:bg-gray-100">
              Vai al Forum
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-roma-red">
              Carica il Tuo Primo Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutForum;