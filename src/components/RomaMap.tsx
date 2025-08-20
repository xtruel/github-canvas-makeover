import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RomaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d36a4c?w=300&h=200&fit=crop'
    },
    { 
      name: 'Pantheon', 
      coords: [12.4768, 41.8986], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Tempio romano del II secolo con la cupola più grande in calcestruzzo non armato al mondo.',
      image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=300&h=200&fit=crop'
    },
    { 
      name: 'Fontana di Trevi', 
      coords: [12.4833, 41.9009], 
      type: 'historical', 
      color: '#6B7280',
      description: 'La più grande e famosa fontana barocca di Roma. Lanciare una moneta garantisce il ritorno nella Città Eterna.',
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=300&h=200&fit=crop'
    },
    { 
      name: 'Piazza di Spagna', 
      coords: [12.4823, 41.9063], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Famosa piazza con la scalinata di Trinità dei Monti, centro dello shopping di lusso romano.',
      image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=300&h=200&fit=crop'
    },
    { 
      name: 'Castel Sant\'Angelo', 
      coords: [12.4663, 41.9031], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Mausoleo di Adriano trasformato in fortezza papale, collegato al Vaticano dal Passetto.',
      image: 'https://images.unsplash.com/photo-1548706651-9acd1b8da9e2?w=300&h=200&fit=crop'
    },
    { 
      name: 'Vittoriano', 
      coords: [12.4828, 41.8956], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Monumento nazionale dedicato a Vittorio Emanuele II, con vista panoramica dalla terrazza.',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop'
    },
    
    // Pub e Bar (marker blu)
    { 
      name: 'Ma Che Siete Venuti a Fà', 
      coords: [12.4692, 41.8896], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storica birreria artigianale nel cuore di Trastevere, famosa per le birre craft e l\'atmosfera autentica.',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop'
    },
    { 
      name: 'Jerry Thomas Project', 
      coords: [12.4756, 41.8934], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar speakeasy nascosto, uno dei migliori cocktail bar d\'Europa con atmosfera vintage.',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=200&fit=crop'
    },
    { 
      name: 'Drink Kong', 
      coords: [12.4724, 41.8955], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Cocktail bar futuristico nel centro storico, famoso per i drink innovativi e il design moderno.',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop'
    },
    
    // Club e Vita Notturna (marker rosa)
    { 
      name: 'Goa Club', 
      coords: [12.5123, 41.8623], 
      type: 'club', 
      color: '#EC4899',
      description: 'Club iconico di Roma con musica elettronica, frequentato da DJ internazionali e giovani romani.',
      image: 'https://images.unsplash.com/photo-1571266028243-d220bc1dbe53?w=300&h=200&fit=crop'
    },
    { 
      name: 'Akab Club', 
      coords: [12.4756, 41.8789], 
      type: 'club', 
      color: '#EC4899',
      description: 'Locale notturno storico di Roma, punto di riferimento per la movida romana da oltre 30 anni.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop'
    },
    
    // Quartieri storici e moderni (marker verdi)
    { 
      name: 'Monti', 
      coords: [12.4856, 41.8956], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere bohémien con boutique vintage, ristoranti caratteristici e atmosfera artistica.',
      image: 'https://images.unsplash.com/photo-1467269204594-9dcb9a5e4b96?w=300&h=200&fit=crop'
    },
    { 
      name: 'San Lorenzo', 
      coords: [12.5234, 41.8934], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere universitario vivace, ricco di pub, ristoranti economici e vita notturna studentesca.',
      image: 'https://images.unsplash.com/photo-1555400080-1e9ccbba1de4?w=300&h=200&fit=crop'
    },
    { 
      name: 'Trastevere', 
      coords: [12.4692, 41.8896], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Quartiere medievale pittoresco con stradine acciottolate, trattorie tradizionali e vita notturna.',
      image: 'https://images.unsplash.com/photo-1516306580123-e6036e65fb85?w=300&h=200&fit=crop'
    },
    
    // Locali per vedere partite Roma maschile (marker rossi)
    { 
      name: 'Stadio Olimpico', 
      coords: [12.4547, 41.9342], 
      type: 'roma-men', 
      color: '#DC2626',
      description: 'Casa dell\'AS Roma e della Lazio, stadio olimpico con capacità di 70.000 spettatori.',
      image: 'https://images.unsplash.com/photo-1576783970982-20c5d7f4b4bc?w=300&h=200&fit=crop'
    },
    { 
      name: 'Bar del Fico', 
      coords: [12.4735, 41.9008], 
      type: 'roma-men', 
      color: '#DC2626',
      description: 'Bar storico nel centro di Roma, punto di ritrovo dei tifosi giallorossi per le partite.',
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=300&h=200&fit=crop'
    },
    
    // Locali Roma femminile (marker viola/magenta)
    { 
      name: 'Centro Sportivo Bernardini', 
      coords: [12.4234, 41.8456], 
      type: 'roma-women', 
      color: '#9333EA',
      description: 'Centro di allenamento dell\'AS Roma Femminile, sede degli allenamenti e delle partite casalinghe.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop'
    },
    
    // Altri punti d\'interesse (marker arancioni)
    { 
      name: 'Campo de\' Fiori', 
      coords: [12.4724, 41.8955], 
      type: 'other', 
      color: '#F97316',
      description: 'Piazza storica con mercato mattutino e vita notturna serale, centro della movida romana.',
      image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=300&h=200&fit=crop'
    },
    { 
      name: 'Villa Borghese', 
      coords: [12.4923, 41.9142], 
      type: 'other', 
      color: '#F97316',
      description: 'Parco pubblico più famoso di Roma con musei, giardini e la Galleria Borghese.',
      image: 'https://images.unsplash.com/photo-1549577802-1c660e4d8bbf?w=300&h=200&fit=crop'
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

      // Create popup with image and description
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(
        `<div class="p-3 max-w-sm">
          ${place.image ? `<img src="${place.image}" alt="${place.name}" class="w-full h-32 object-cover rounded-md mb-2" />` : ''}
          <h3 class="font-bold text-base mb-1">${place.name}</h3>
          <p class="text-xs text-blue-600 mb-2 font-medium">${getTypeLabel(place.type)}</p>
          ${place.description ? `<p class="text-sm text-gray-700 leading-relaxed">${place.description}</p>` : ''}
        </div>`
      );

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat(place.coords as [number, number])
        .setPopup(popup)
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
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[400px] sm:h-screen sm:aspect-square rounded-lg overflow-hidden shadow-roma border border-border/50">
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
  );
};

export default RomaMap;