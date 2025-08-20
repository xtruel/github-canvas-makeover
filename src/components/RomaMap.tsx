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
    { name: 'Colosseo', coords: [12.4924, 41.8902], type: 'historical', color: '#6B7280' },
    { name: 'Pantheon', coords: [12.4768, 41.8986], type: 'historical', color: '#6B7280' },
    { name: 'Fontana di Trevi', coords: [12.4833, 41.9009], type: 'historical', color: '#6B7280' },
    { name: 'Piazza di Spagna', coords: [12.4823, 41.9063], type: 'historical', color: '#6B7280' },
    { name: 'Castel Sant\'Angelo', coords: [12.4663, 41.9031], type: 'historical', color: '#6B7280' },
    { name: 'Vittoriano', coords: [12.4828, 41.8956], type: 'historical', color: '#6B7280' },
    { name: 'Piramide Cestia', coords: [12.4816, 41.8757], type: 'historical', color: '#6B7280' },
    { name: 'Terme di Caracalla', coords: [12.4923, 41.8789], type: 'historical', color: '#6B7280' },
    { name: 'Circo Massimo', coords: [12.4856, 41.8854], type: 'historical', color: '#6B7280' },
    { name: 'Mercati di Traiano', coords: [12.4856, 41.8956], type: 'historical', color: '#6B7280' },
    { name: 'Villa Adriana', coords: [12.7763, 41.9404], type: 'historical', color: '#6B7280' },
    { name: 'Ostia Antica', coords: [12.2919, 41.7614], type: 'historical', color: '#6B7280' },
    { name: 'Palazzo Altemps', coords: [12.4742, 41.8992], type: 'historical', color: '#6B7280' },
    { name: 'Crypta Balbi', coords: [12.4765, 41.8946], type: 'historical', color: '#6B7280' },
    { name: 'Palazzo Massimo', coords: [12.4976, 41.9021], type: 'historical', color: '#6B7280' },
    
    // Pub e Bar (marker blu)
    { name: 'Ma Che Siete Venuti a Fà', coords: [12.4692, 41.8896], type: 'pub', color: '#2563EB' },
    { name: 'Rec 23', coords: [12.5234, 41.8934], type: 'pub', color: '#2563EB' },
    { name: 'Il Sorpasso', coords: [12.4589, 41.9089], type: 'pub', color: '#2563EB' },
    { name: 'Jerry Thomas Project', coords: [12.4756, 41.8934], type: 'pub', color: '#2563EB' },
    { name: 'Ice Club', coords: [12.4769, 41.9011], type: 'pub', color: '#2563EB' },
    { name: 'Barnum Cafe', coords: [12.4856, 41.8967], type: 'pub', color: '#2563EB' },
    { name: 'Drink Kong', coords: [12.4724, 41.8955], type: 'pub', color: '#2563EB' },
    { name: 'Gin Corner', coords: [12.4667, 41.8897], type: 'pub', color: '#2563EB' },
    { name: 'Co.So. Cocktail & Soul', coords: [12.5123, 41.8856], type: 'pub', color: '#2563EB' },
    
    // Club e Vita Notturna (marker rosa)
    { name: 'Goa Club', coords: [12.5123, 41.8623], type: 'club', color: '#EC4899' },
    { name: 'Akab Club', coords: [12.4756, 41.8789], type: 'club', color: '#EC4899' },
    { name: 'Room 26', coords: [12.4769, 41.9011], type: 'club', color: '#EC4899' },
    { name: 'Lanificio 159', coords: [12.5234, 41.8934], type: 'club', color: '#EC4899' },
    { name: 'Ex Dogana', coords: [12.5123, 41.8856], type: 'club', color: '#EC4899' },
    { name: 'Rashomon Club', coords: [12.4667, 41.8897], type: 'club', color: '#EC4899' },
    { name: 'Planet Roma', coords: [12.4589, 41.9089], type: 'club', color: '#EC4899' },
    { name: 'Micca Club', coords: [12.4735, 41.9008], type: 'club', color: '#EC4899' },
    
    // Quartieri storici e moderni (marker verdi)
    { name: 'Monti', coords: [12.4856, 41.8956], type: 'neighborhood', color: '#16A34A' },
    { name: 'San Lorenzo', coords: [12.5234, 41.8934], type: 'neighborhood', color: '#16A34A' },
    { name: 'Pigneto', coords: [12.5456, 41.8856], type: 'neighborhood', color: '#16A34A' },
    { name: 'EUR', coords: [12.4689, 41.8356], type: 'neighborhood', color: '#16A34A' },
    { name: 'Garbatella', coords: [12.4789, 41.8623], type: 'neighborhood', color: '#16A34A' },
    { name: 'Ostiense', coords: [12.4756, 41.8689], type: 'neighborhood', color: '#16A34A' },
    { name: 'Prati', coords: [12.4589, 41.9089], type: 'neighborhood', color: '#16A34A' },
    { name: 'Borgo', coords: [12.4587, 41.9023], type: 'neighborhood', color: '#16A34A' },
    { name: 'Flaminio', coords: [12.4723, 41.9167], type: 'neighborhood', color: '#16A34A' },
    
    // Locali per vedere partite Roma maschile (marker rossi)
    { name: 'Stadio Olimpico', coords: [12.4547, 41.9342], type: 'roma-men', color: '#DC2626' },
    { name: 'Bar del Fico', coords: [12.4735, 41.9008], type: 'roma-men', color: '#DC2626' },
    { name: 'Salotto 42', coords: [12.4769, 41.9011], type: 'roma-men', color: '#DC2626' },
    { name: 'The Drunken Ship', coords: [12.4722, 41.8935], type: 'roma-men', color: '#DC2626' },
    { name: 'Scholars Lounge', coords: [12.4687, 41.8962], type: 'roma-men', color: '#DC2626' },
    { name: 'Yellow Bar', coords: [12.4813, 41.9055], type: 'roma-men', color: '#DC2626' },
    
    // Locali Roma femminile (marker viola/magenta)
    { name: 'Centro Sportivo Bernardini', coords: [12.4234, 41.8456], type: 'roma-women', color: '#9333EA' },
    { name: 'Mood Roma', coords: [12.4756, 41.9023], type: 'roma-women', color: '#9333EA' },
    { name: 'Freni e Frizioni', coords: [12.4667, 41.8897], type: 'roma-women', color: '#9333EA' },
    
    // Altri punti d'interesse (marker arancioni)
    { name: 'Trastevere', coords: [12.4692, 41.8896], type: 'other', color: '#F97316' },
    { name: 'Campo de\' Fiori', coords: [12.4724, 41.8955], type: 'other', color: '#F97316' },
    { name: 'Piazza Navona', coords: [12.4731, 41.8992], type: 'other', color: '#F97316' },
    { name: 'Villa Borghese', coords: [12.4923, 41.9142], type: 'other', color: '#F97316' },
    { name: 'Testaccio', coords: [12.4756, 41.8789], type: 'other', color: '#F97316' },
    { name: 'Aventino', coords: [12.4834, 41.8823], type: 'other', color: '#F97316' },
    { name: 'Gianicolo', coords: [12.4598, 41.8912], type: 'other', color: '#F97316' },
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

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-sm">${place.name}</h3>
          <p class="text-xs text-gray-600">${getTypeLabel(place.type)}</p>
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