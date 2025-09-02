import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Heart, Share2, Image, Video, FileText } from "lucide-react";

const Forum = () => {
  const mockPosts = [
    {
      id: 1,
      type: "text",
      author: "RomanistaDoc",
      avatar: "RD",
      title: "Analisi tattica della partita di ieri",
      content: "Che prestazione incredibile della Roma! La fase difensiva è stata impeccabile e il centrocampo ha dominato per tutta la partita. Mourinho ha fatto le scelte giuste con i cambi. Dybala semplicemente magico! 💛❤️",
      timestamp: "2 ore fa",
      likes: 47,
      comments: 12,
      shares: 3,
      tags: ["Tattica", "Partita"]
    },
    {
      id: 2,
      type: "image",
      author: "GialloRosso92",
      avatar: "GR",
      title: "Foto dal settore Curva Sud ieri sera",
      content: "L'atmosfera era elettrizzante! Che tifo ragazzi! 🔥",
      imageUrl: `${import.meta.env.BASE_URL}mock/roma-fans-1.svg`,
      timestamp: "4 ore fa",
      likes: 89,
      comments: 23,
      shares: 15,
      tags: ["Curva Sud", "Tifo"]
    },
    {
      id: 3,
      type: "video",
      author: "CapitanTotti",
      avatar: "CT",
      title: "Intervista esclusiva con Pellegrini post-partita",
      content: "Il nostro capitano parla della vittoria e degli obiettivi per il resto della stagione. Da brividi! 👑",
      videoUrl: "/mock/interview-1.mp4",
      timestamp: "6 ore fa",
      likes: 156,
      comments: 34,
      shares: 28,
      tags: ["Intervista", "Pellegrini"]
    },
    {
      id: 4,
      type: "text",
      author: "RomaTifosa",
      avatar: "RT",
      title: "Raduno romanisti Milano - Domenica 15",
      content: "Ciao romanisti del nord! Organizziamo un raduno per vedere Roma-Milan tutti insieme al Caffè Centrale di Milano. Chi c'è? Scrivetemi in privato per i dettagli! Forza Roma sempre! 🐺",
      timestamp: "8 ore fa",
      likes: 31,
      comments: 18,
      shares: 7,
      tags: ["Raduno", "Milano"]
    },
    {
      id: 5,
      type: "image",
      author: "RomaStoria",
      avatar: "RS",
      title: "Ricordi indimenticabili - Totti vs Lazio 2004",
      content: "20 anni fa questo momento magico. Il derby più bello di sempre! Chi c'era all'Olimpico quel giorno? 🏟️⚡",
      imageUrl: `${import.meta.env.BASE_URL}mock/totti-celebration.svg`,
      timestamp: "12 ore fa",
      likes: 203,
      comments: 67,
      shares: 45,
      tags: ["Storia", "Totti", "Derby"]
    },
    {
      id: 6,
      type: "video",
      author: "UltrasRoma",
      avatar: "UR",
      title: "Cori prima della partita - Atmosfera da brividi",
      content: "I nostri cori risuonano in tutto lo stadio! Questa è la Roma che amiamo! 🎵🔊",
      videoUrl: "/mock/fan-chants.mp4",
      timestamp: "1 giorno fa",
      likes: 124,
      comments: 28,
      shares: 19,
      tags: ["Cori", "Ultras"]
    }
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500/20 text-blue-400";
      case "video":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-roma-gold">
            Forum Romanisti
          </h1>
          <p className="text-muted-foreground mt-2">
            Discuti, condividi e vivi la passione giallorossa con la community
          </p>
        </div>
        <Button className="bg-roma-gold hover:bg-roma-yellow text-black font-semibold">
          Nuovo Post
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-glow border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-roma-gold" />
                <div>
                  <p className="text-sm text-muted-foreground">Membri Online</p>
                  <p className="text-xl font-bold text-roma-gold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-glow border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-roma-yellow" />
                <div>
                  <p className="text-sm text-muted-foreground">Post Oggi</p>
                  <p className="text-xl font-bold text-roma-yellow">89</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-glow border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-roma-red" />
                <div>
                  <p className="text-sm text-muted-foreground">Like Totali</p>
                  <p className="text-xl font-bold text-roma-red">2,156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-glow border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Condivisioni</p>
                  <p className="text-xl font-bold text-primary">347</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <Card key={post.id} className="shadow-roma border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-roma-gold rounded-full flex items-center justify-center text-black font-bold">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{post.author}</p>
                        <Badge variant="outline" className={`text-xs ${getPostTypeColor(post.type)}`}>
                          {getPostIcon(post.type)}
                          <span className="ml-1 capitalize">{post.type}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg text-foreground">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.content}</p>
                
                {/* Media Content */}
                {post.type === "image" && post.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt="Post content" 
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
                
                {post.type === "video" && post.videoUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center h-64">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-roma-gold mx-auto mb-2" />
                      <p className="text-muted-foreground">Video Preview</p>
                      <p className="text-sm text-muted-foreground/60">{post.videoUrl}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-roma-red">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-roma-gold">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-roma-yellow">
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;