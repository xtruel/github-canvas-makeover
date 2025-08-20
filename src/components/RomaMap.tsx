import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X } from 'lucide-react';

// Import local images
import colosseocolosseoImage from '@/assets/colosseo-roma.jpg';
import pantheonImage from '@/assets/pantheon-interno.jpg';
import fontanaTreviImage from '@/assets/fontana-trevi-roma.jpg';
import piazzaSpagnaImage from '@/assets/piazza-spagna-roma.jpg';
import vitorianoImage from '@/assets/vittoriano-altare.jpg';
import trastevereImage from '@/assets/trastevere-roma.jpg';
import barRomanoImage from '@/assets/bar-romano.jpg';
import clubNotturnoImage from '@/assets/club-notturno.jpg';
import quartiereStoricoImage from '@/assets/quartiere-storico.jpg';

const RomaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Token Mapbox fornito dall'utente
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVyaWVyb21hbmUiLCJhIjoiY21lanVmMWVnMDFsdjJrczc2Mm12Y3QyNyJ9.J1I-1msTs5pOeccQAuQ4yg';

  // Luoghi di Roma con marker colorati - Database completo con Google Places
  const romaPlaces = [
    // Luoghi storici e monumenti (marker grigi)
    { 
      name: 'Colosseo', 
      coords: [12.4924, 41.8902], 
      type: 'historical', 
      color: '#6B7280',
      description: 'L\'Anfiteatro Flavio (I secolo d.C.), costruito dagli imperatori della dinastia flavia, è il simbolo eterno di Roma. Alto 50 metri e lungo 189, poteva ospitare fino a 75.000 spettatori per i leggendari combattimenti gladiatori e le cacce selvagge (venationes). Patrimonio UNESCO dal 1980.',
      image: colosseocolosseoImage
    },
    { 
      name: 'Pantheon', 
      coords: [12.4768, 41.8986], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Miracolo dell\'architettura antica, il Pantheon (126 d.C.) vanta la cupola in calcestruzzo non armato più grande al mondo (43,3 metri di diametro). L\'oculo centrale illumina naturalmente questo tempio romano trasformato in basilica cristiana. Tomba di Raffaello e dei re d\'Italia.',
      image: pantheonImage
    },
    { 
      name: 'Fontana di Trevi', 
      coords: [12.4833, 41.9009], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Capolavoro del tardo barocco (1732-1762) progettato da Nicola Salvi, è la più grandiosa delle 2000+ fontane romane. Alta 26 metri e larga 49, rappresenta Nettuno con i tritoni. La leggenda vuole che lanciare una moneta con la mano destra sopra la spalla sinistra garantisca il ritorno a Roma.',
      image: fontanaTreviImage
    },
    { 
      name: 'Piazza di Spagna', 
      coords: [12.4823, 41.9063], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Cuore elegante di Roma con la famosa scalinata di Trinità dei Monti (135 gradini, 1723-1726). Ai piedi, la Fontana della Barcaccia del Bernini padre. Via dei Condotti offre shopping di lusso dalle grandi maison internazionali. Dimora di Keats e Byron nell\'800.',
      image: piazzaSpagnaImage
    },
    { 
      name: 'Castel Sant\'Angelo', 
      coords: [12.4663, 41.9031], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Nato come Mausoleo di Adriano (139 d.C.), divenne fortezza medievale e residenza papale rinascimentale. Il Passetto di Borgo lo collegava al Vaticano per le fughe papali. Oggi museo con 58 stanze affrescate, terrazza panoramica e la statua dell\'Arcangelo Michele che domina il Tevere.',
      image: 'https://cdn.pixabay.com/photo/2020/07/04/07/02/castel-santangelo-5369688_1280.jpg'
    },
    { 
      name: 'Vittoriano', 
      coords: [12.4828, 41.8956], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Altare della Patria dedicato a Vittorio Emanuele II, primo re d\'Italia unita. Inaugurato nel 1935, è soprannominato "Macchina da scrivere" dai romani. Ospita il Milite Ignoto, il Museo del Risorgimento e terrazze panoramiche con ascensori panoramici che offrono vista a 360° su Roma.',
      image: vitorianoImage
    },
    
    // Pub e Bar (marker blu)
    { 
      name: 'Ma Che Siete Venuti a Fà', 
      coords: [12.4692, 41.8896], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storica birreria artigianale nel cuore di Trastevere, famosa per le birre craft e l\'atmosfera autentica.',
      image: barRomanoImage
    },
    { 
      name: 'Jerry Thomas Project', 
      coords: [12.4756, 41.8934], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar speakeasy nascosto, uno dei migliori cocktail bar d\'Europa con atmosfera vintage.',
      image: barRomanoImage
    },
    { 
      name: 'Drink Kong', 
      coords: [12.4724, 41.8955], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar futuristico nel centro storico, famoso per i drink innovativi e il design moderno.',
      image: barRomanoImage
    },
    
    // Caffè Storici di Roma (marker blu)
    { 
      name: 'Caffè Sant\'Eustachio', 
      coords: [12.4751, 41.8986], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Antica torrefazione a legna nata nel 1938, uno dei caffè più amati di Roma in Piazza Sant\'Eustachio.',
      image: barRomanoImage
    },
    { 
      name: 'Antico Caffè Greco', 
      coords: [12.4823, 41.9058], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Il più antico caffè di Roma (1760), frequentato da D\'Annunzio, Casanova, Nietzsche e Pasolini. La più grande galleria d\'arte aperta al pubblico.',
      image: barRomanoImage
    },
    { 
      name: 'Caffè Museo Atelier Canova Tadolini', 
      coords: [12.4804, 41.9078], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Caffè-museo in via del Babuino, nell\'antico studio di Canova. Si sorseggia il caffè tra arte e sculture.',
      image: barRomanoImage
    },
    { 
      name: 'Bar Rosati', 
      coords: [12.4812, 41.9123], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storico bar dal 1922, frequentato da artisti e intellettuali. Punto di ritrovo dei pittori di via Margutta negli anni \'30.',
      image: barRomanoImage
    },
    { 
      name: 'Caffè Palombini', 
      coords: [12.4623, 41.8389], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Nato nel 1963 all\'EUR, simbolo del quartiere e punto di ritrovo vicino al Palazzo della Civiltà (Colosseo Quadrato).',
      image: barRomanoImage
    },
    { 
      name: 'Sciascia Caffè', 
      coords: [12.4634, 41.9089], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Dal 1919 nel quartiere Prati, torrefazione con ambientazione retrò e specialità come il caffè con cioccolato fondente.',
      image: barRomanoImage
    },
    { 
      name: 'Castroni', 
      coords: [12.4645, 41.9078], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Nato nel 1932, storico locale in via Cola di Rienzo. Drogheria, caffetteria e torrefazione, sinonimo di "caffè buono".',
      image: barRomanoImage
    },
    { 
      name: 'Harry\'s Bar', 
      coords: [12.4889, 41.9089], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Il bar della Dolce Vita fondato nel 1959 in via Veneto, frequentato da Fellini e comparse nei suoi film.',
      image: barRomanoImage
    },
    { 
      name: 'Caffè Tazza D\'Oro', 
      coords: [12.4756, 41.8992], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storica torrefazione zona Pantheon, famosa per il caffè e la granita con doppia panna. C\'è sempre fila nel weekend.',
      image: barRomanoImage
    },
    { 
      name: 'Babingtons Tea Room', 
      coords: [12.4823, 41.9063], 
      type: 'pub', 
      color: '#2563EB',
      description: 'In Piazza di Spagna, punto di riferimento per il rito del tè inglese. Frequentato da Keats, Byron, Goethe e De Chirico.',
      image: barRomanoImage
    },
    
    // Club e Vita Notturna (marker rosa)
    { 
      name: 'Goa Club', 
      coords: [12.5123, 41.8623], 
      type: 'club', 
      color: '#EC4899',
      description: 'Club iconico di Roma con musica elettronica, frequentato da DJ internazionali e giovani romani.',
      image: clubNotturnoImage
    },
    { 
      name: 'Akab Club', 
      coords: [12.4756, 41.8789], 
      type: 'club', 
      color: '#EC4899',
      description: 'Locale notturno storico di Roma, punto di riferimento per la movida romana da oltre 30 anni.',
      image: clubNotturnoImage
    },
    
    // Quartieri storici e moderni (marker verdi)
    { 
      name: 'Monti', 
      coords: [12.4856, 41.8956], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere bohémien con boutique vintage, ristoranti caratteristici e atmosfera artistica.',
      image: quartiereStoricoImage
    },
    { 
      name: 'San Lorenzo', 
      coords: [12.5234, 41.8934], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere universitario vivace, ricco di pub, ristoranti economici e vita notturna studentesca.',
      image: quartiereStoricoImage
    },
    { 
      name: 'Trastevere', 
      coords: [12.4692, 41.8896], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere medievale pittoresco con stradine acciottolate, trattorie tradizionali e vita notturna.',
      image: trastevereImage
    },
    
    // Stadi di Roma (marker arancioni scuri)
    { 
      name: 'Stadio Olimpico', 
      coords: [12.4547, 41.9342], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio principale di Roma, casa di AS Roma e Lazio. Ospitò i Giochi Olimpici del 1960 e la finale dei Mondiali 1990.',
      image: 'https://cdn.pixabay.com/photo/2016/06/07/14/14/stadium-1442616_1280.jpg'
    },
    { 
      name: 'Stadio Flaminio', 
      coords: [12.4712, 41.9234], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio storico progettato da Pier Luigi Nervi per le Olimpiadi del 1960, oggi utilizzato per rugby.',
      image: 'https://cdn.pixabay.com/photo/2016/06/16/16/32/stadium-1461329_1280.jpg'
    },
    { 
      name: 'Stadio dei Marmi Pietro Mennea', 
      coords: [12.4589, 41.9312], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio di atletica leggera del Foro Italico, decorato con 60 statue di marmo di atleti.',
      image: 'https://cdn.pixabay.com/photo/2014/05/18/11/25/track-and-field-346542_1280.jpg'
    },
    { 
      name: 'Stadio Nando Martellini', 
      coords: [12.4578, 41.9289], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio di atletica leggera nel Foro Italico, sede di importanti eventi internazionali.',
      image: 'https://cdn.pixabay.com/photo/2016/03/28/09/22/stadium-1285396_1280.jpg'
    },
    { 
      name: 'Stadio della Rondinella', 
      coords: [12.4423, 41.8956], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio storico nel quartiere Flaminio, utilizzato per calcio giovanile e eventi sportivi locali.',
      image: 'https://cdn.pixabay.com/photo/2013/11/25/10/58/grass-217637_1280.jpg'
    },
    { 
      name: 'Stadio Tre Fontane', 
      coords: [12.4623, 41.8234], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio moderno nell\'EUR utilizzato per calcio e rugby, sede di diverse società sportive.',
      image: 'https://cdn.pixabay.com/photo/2016/07/25/10/42/football-1540047_1280.jpg'
    },
    { 
      name: 'Trastevere Stadium', 
      coords: [12.4634, 41.8823], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Stadio nel quartiere Trastevere, sede dell\'ASD Trastevere Calcio e altri eventi sportivi.',
      image: 'https://cdn.pixabay.com/photo/2018/03/01/14/57/architecture-3190254_1280.jpg'
    },
    { 
      name: 'Campo Testaccio', 
      coords: [12.4723, 41.8756], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Campo storico dove nacque l\'AS Roma nel 1927, oggi area residenziale con memoria storica.',
      image: 'https://cdn.pixabay.com/photo/2018/01/21/17/04/soccer-3097455_1280.jpg'
    },
    { 
      name: 'Stadio Centrale del Tennis', 
      coords: [12.4567, 41.9298], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Campo centrale del Foro Italico, sede degli Internazionali d\'Italia di tennis.',
      image: 'https://cdn.pixabay.com/photo/2015/07/19/10/01/tennis-852246_1280.jpg'
    },
    { 
      name: 'Stadio Nicola Pietrangeli', 
      coords: [12.4545, 41.9278], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Campo da tennis del Foro Italico, secondo campo più importante per gli Internazionali d\'Italia.',
      image: 'https://cdn.pixabay.com/photo/2016/10/22/12/26/tennis-1761277_1280.jpg'
    },

    // Locali per vedere partite Roma maschile (marker rossi)
    { 
      name: 'Bar del Fico', 
      coords: [12.4735, 41.9008], 
      type: 'roma-men', 
      color: '#DC2626',
      description: 'Bar storico nel centro di Roma, punto di ritrovo dei tifosi giallorossi per le partite.',
      image: 'https://cdn.pixabay.com/photo/2017/03/27/14/33/bar-2179309_1280.jpg'
    },
    
    // Locali Roma femminile (marker viola/magenta)
    { 
      name: 'Centro Sportivo Bernardini', 
      coords: [12.4234, 41.8456], 
      type: 'roma-women', 
      color: '#9333EA',
      description: 'Centro di allenamento dell\'AS Roma Femminile, sede degli allenamenti e delle partite casalinghe.',
      image: 'https://cdn.pixabay.com/photo/2016/02/13/12/26/aurora-1197753_1280.jpg'
    },
    
    // Altri punti d\'interesse (marker arancioni)
    { 
      name: 'Campo de\' Fiori', 
      coords: [12.4724, 41.8955], 
      type: 'other', 
      color: '#F97316',
      description: 'Piazza storica con mercato mattutino e vita notturna serale, centro della movida romana.',
      image: 'https://cdn.pixabay.com/photo/2020/01/09/01/00/campo-de-fiori-4751848_1280.jpg'
    },
    { 
      name: 'Villa Borghese', 
      coords: [12.4923, 41.9142], 
      type: 'other', 
      color: '#F97316',
      description: 'Parco pubblico più famoso di Roma con musei, giardini e la Galleria Borghese.',
      image: 'https://cdn.pixabay.com/photo/2018/05/30/15/31/villa-borghese-3441799_1280.jpg'
    },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'historical': return 'Luogo Storico';
      case 'pub': return 'Pub & Bar';
      case 'club': return 'Club & Vita Notturna';
      case 'neighborhood': return 'Quartiere';
      case 'stadium': return 'Stadio';
      case 'roma-men': return 'Partite Roma';
      case 'roma-women': return 'Roma Femminile';
      case 'other': return 'Punto di Interesse';
      default: return 'Luogo';
    }
  };

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [12.4964, 41.9028], // Centro di Roma
      zoom: 12,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for each place
    romaPlaces.forEach((place) => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.backgroundColor = place.color;
      markerEl.style.width = '20px';
      markerEl.style.height = '20px';
      markerEl.style.borderRadius = '50% 50% 50% 0';
      markerEl.style.transform = 'rotate(-45deg)';
      markerEl.style.border = '2px solid white';
      markerEl.style.cursor = 'pointer';
      markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      // Add click handler for both mobile and desktop
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPlace(place);
      });

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat(place.coords as [number, number])
        .addTo(map.current!);
    });

    // Add atmosphere effect
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.1,
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Desktop Layout */}
      <div className={`hidden sm:flex gap-4 transition-all duration-300 ${
        selectedPlace ? 'h-[400px]' : 'h-[400px]'
      }`}>
        {/* Map Container - Desktop */}
        <div className={`relative rounded-lg overflow-hidden shadow-roma border border-border/50 transition-all duration-300 ${
          selectedPlace ? 'w-2/3' : 'w-full'
        }`}>
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Legend - Desktop */}
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 max-w-[200px]">
            <h4 className="text-sm font-bold mb-2 text-roma-gold">Legenda</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-700 border border-white flex-shrink-0"></div>
                <span className="truncate">Stadi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 border border-white flex-shrink-0"></div>
                <span className="truncate">Partite Roma</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600 border border-white flex-shrink-0"></div>
                <span className="truncate">Roma Femminile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 border border-white flex-shrink-0"></div>
                <span className="truncate">Pub & Bar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500 border border-white flex-shrink-0"></div>
                <span className="truncate">Club</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600 border border-white flex-shrink-0"></div>
                <span className="truncate">Quartieri</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500 border border-white flex-shrink-0"></div>
                <span className="truncate">Luoghi Storici</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 border border-white flex-shrink-0"></div>
                <span className="truncate">Punti d'Interesse</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Side Panel */}
        {selectedPlace && (
          <div className="w-1/3 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 flex flex-col">
            <div className="flex justify-between items-start p-4 border-b border-border/50">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selectedPlace.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{getTypeLabel(selectedPlace.type)}</p>
              </div>
              <button 
                onClick={() => setSelectedPlace(null)}
                className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedPlace.image && (
                <img 
                  src={selectedPlace.image} 
                  alt={selectedPlace.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {selectedPlace.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedPlace.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="relative h-[calc(100vh-4rem)] rounded-lg overflow-hidden shadow-roma border border-border/50">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Mobile Header */}
          <div className="absolute top-2 left-2 right-2 z-20 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <h2 className="text-lg font-semibold text-roma-gold">Discover the Eternal City</h2>
          </div>
        </div>

        {/* Mobile Place Details */}
        {selectedPlace && (
          <div className="mt-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedPlace.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{getTypeLabel(selectedPlace.type)}</p>
              </div>
              <button 
                onClick={() => setSelectedPlace(null)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {selectedPlace.image && (
              <img 
                src={selectedPlace.image} 
                alt={selectedPlace.name}
                className="w-full h-48 object-cover rounded-md mb-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            {selectedPlace.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedPlace.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RomaMap;