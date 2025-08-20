import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RomaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Token Mapbox fornito dall'utente
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVyaWVyb21hbmUiLCJhIjoiY21lanVmMWVnMDFsdjJrczc2Mm12Y3QyNyJ9.J1I-1msTs5pOeccQAuQ4yg';

  // Luoghi di Roma con marker colorati (simulando la mappa originale)
  const romaPlaces = [
    // Luoghi storici (marker grigi)
    { name: 'Colosseo', coords: [12.4924, 41.8902], type: 'historical', color: '#6B7280' },
    { name: 'Pantheon', coords: [12.4768, 41.8986], type: 'historical', color: '#6B7280' },
    { name: 'Fontana di Trevi', coords: [12.4833, 41.9009], type: 'historical', color: '#6B7280' },
    { name: 'Piazza di Spagna', coords: [12.4823, 41.9063], type: 'historical', color: '#6B7280' },
    { name: 'Castel Sant\'Angelo', coords: [12.4663, 41.9031], type: 'historical', color: '#6B7280' },
    
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
    
    // Altri luoghi interessanti (marker arancioni)
    { name: 'Trastevere', coords: [12.4692, 41.8896], type: 'other', color: '#F97316' },
    { name: 'Campo de\' Fiori', coords: [12.4724, 41.8955], type: 'other', color: '#F97316' },
    { name: 'Piazza Navona', coords: [12.4731, 41.8992], type: 'other', color: '#F97316' },
    { name: 'Villa Borghese', coords: [12.4923, 41.9142], type: 'other', color: '#F97316' },
    { name: 'Testaccio', coords: [12.4756, 41.8789], type: 'other', color: '#F97316' },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'historical': return 'Luogo Storico';
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
    <div className="relative w-full h-[525px] rounded-lg overflow-hidden shadow-roma border border-border/50">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50">
        <h4 className="text-sm font-bold mb-2 text-roma-gold">Legenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
            <span>Partite Roma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600 border border-white"></div>
            <span>Roma Femminile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
            <span>Punti d'Interesse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500 border border-white"></div>
            <span>Luoghi Storici</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RomaMap;