import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X } from 'lucide-react';

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
      description: 'Anfiteatro romano del I secolo, simbolo di Roma e patrimonio UNESCO. Qui si svolgevano i combattimenti gladiatori.',
      image: 'https://cdn.pixabay.com/photo/2020/06/05/10/01/colosseum-5264712_1280.jpg'
    },
    { 
      name: 'Pantheon', 
      coords: [12.4768, 41.8986], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Tempio romano del II secolo con la cupola più grande in calcestruzzo non armato al mondo.',
      image: 'https://cdn.pixabay.com/photo/2020/04/20/11/49/pantheon-5067173_1280.jpg'
    },
    { 
      name: 'Fontana di Trevi', 
      coords: [12.4833, 41.9009], 
      type: 'historical', 
      color: '#6B7280',
      description: 'La più grande e famosa fontana barocca di Roma. Lanciare una moneta garantisce il ritorno nella Città Eterna.',
      image: 'https://cdn.pixabay.com/photo/2020/02/06/15/52/trevi-fountain-4825089_1280.jpg'
    },
    { 
      name: 'Piazza di Spagna', 
      coords: [12.4823, 41.9063], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Famosa piazza con la scalinata di Trinità dei Monti, centro dello shopping di lusso romano.',
      image: 'https://cdn.pixabay.com/photo/2016/02/17/21/38/spanish-steps-1205648_1280.jpg'
    },
    { 
      name: 'Castel Sant\'Angelo', 
      coords: [12.4663, 41.9031], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Mausoleo di Adriano trasformato in fortezza papale, collegato al Vaticano dal Passetto.',
      image: 'https://cdn.pixabay.com/photo/2020/07/04/07/02/castel-santangelo-5369688_1280.jpg'
    },
    { 
      name: 'Vittoriano', 
      coords: [12.4828, 41.8956], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Monumento nazionale dedicato a Vittorio Emanuele II, con vista panoramica dalla terrazza.',
      image: 'https://cdn.pixabay.com/photo/2018/07/14/17/46/rome-3537430_1280.jpg'
    },
    
    // Pub e Bar (marker blu)
    { 
      name: 'Ma Che Siete Venuti a Fà', 
      coords: [12.4692, 41.8896], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storica birreria artigianale nel cuore di Trastevere, famosa per le birre craft e l\'atmosfera autentica.',
      image: 'https://cdn.pixabay.com/photo/2016/11/21/16/21/bar-1846137_1280.jpg'
    },
    { 
      name: 'Jerry Thomas Project', 
      coords: [12.4756, 41.8934], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar speakeasy nascosto, uno dei migliori cocktail bar d\'Europa con atmosfera vintage.',
      image: 'https://cdn.pixabay.com/photo/2015/03/26/14/24/bar-690699_1280.jpg'
    },
    { 
      name: 'Drink Kong', 
      coords: [12.4724, 41.8955], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar futuristico nel centro storico, famoso per i drink innovativi e il design moderno.',
      image: 'https://cdn.pixabay.com/photo/2016/11/29/05/36/bar-1867408_1280.jpg'
    },
    
    // Club e Vita Notturna (marker rosa)
    { 
      name: 'Goa Club', 
      coords: [12.5123, 41.8623], 
      type: 'club', 
      color: '#EC4899',
      description: 'Club iconico di Roma con musica elettronica, frequentato da DJ internazionali e giovani romani.',
      image: 'https://cdn.pixabay.com/photo/2015/07/02/20/57/club-829978_1280.jpg'
    },
    { 
      name: 'Akab Club', 
      coords: [12.4756, 41.8789], 
      type: 'club', 
      color: '#EC4899',
      description: 'Locale notturno storico di Roma, punto di riferimento per la movida romana da oltre 30 anni.',
      image: 'https://cdn.pixabay.com/photo/2015/05/15/14/27/nightclub-768434_1280.jpg'
    },
    
    // Quartieri storici e moderni (marker verdi)
    { 
      name: 'Monti', 
      coords: [12.4856, 41.8956], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere bohémien con boutique vintage, ristoranti caratteristici e atmosfera artistica.',
      image: 'https://cdn.pixabay.com/photo/2018/04/18/13/18/rome-3331148_1280.jpg'
    },
    { 
      name: 'San Lorenzo', 
      coords: [12.5234, 41.8934], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere universitario vivace, ricco di pub, ristoranti economici e vita notturna studentesca.',
      image: 'https://cdn.pixabay.com/photo/2018/09/29/22/52/rome-3711108_1280.jpg'
    },
    { 
      name: 'Trastevere', 
      coords: [12.4692, 41.8896], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere medievale pittoresco con stradine acciottolate, trattorie tradizionali e vita notturna.',
      image: 'https://cdn.pixabay.com/photo/2018/07/26/07/45/trastevere-3562345_1280.jpg'
    },
    
    // Locali per vedere partite Roma maschile (marker rossi)
    { 
      name: 'Stadio Olimpico', 
      coords: [12.4547, 41.9342], 
      type: 'roma-men', 
      color: '#DC2626',
      description: 'Casa dell\'AS Roma e della Lazio, stadio olimpico con capacità di 70.000 spettatori.',
      image: 'https://cdn.pixabay.com/photo/2016/06/07/14/14/stadium-1442616_1280.jpg'
    },
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

      // Create popup for desktop, handle click for mobile
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(
        `<div class="p-3 max-w-sm">
          ${place.image ? `<img src="${place.image}" alt="${place.name}" class="w-full h-32 object-cover rounded-md mb-2" />` : ''}
          <h3 class="font-bold text-base mb-1">${place.name}</h3>
          <p class="text-xs text-blue-600 mb-2 font-medium">${getTypeLabel(place.type)}</p>
          ${place.description ? `<p class="text-sm text-gray-700 leading-relaxed">${place.description}</p>` : ''}
        </div>`
      );

      // Add click handler for mobile
      markerEl.addEventListener('click', () => {
        if (window.innerWidth < 640) {
          setSelectedPlace(place);
        }
      });

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(place.coords as [number, number])
        .addTo(map.current!);
      
      // Only add popup for desktop
      if (window.innerWidth >= 640) {
        marker.setPopup(popup);
      }
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
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative h-[400px] md:h-[400px] sm:h-[60vh] rounded-lg overflow-hidden shadow-roma border border-border/50">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Legend - responsive positioning */}
        <div className="absolute top-4 left-4 sm:top-2 sm:left-2 bg-background/95 backdrop-blur-sm rounded-lg p-3 sm:p-2 shadow-lg border border-border/50 max-w-[200px] sm:max-w-[150px]">
          <h4 className="text-sm font-bold mb-2 text-roma-gold">Legenda</h4>
          <div className="space-y-1 text-xs">
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

      {/* Mobile Place Details */}
      {isMobile && selectedPlace && (
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
  );
};

export default RomaMap;