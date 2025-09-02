import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Access token: provided directly for now. Recommended: move to .env as VITE_MAPBOX_TOKEN
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZnVyaWVyb21hbmUiLCJhIjoiY21lanVmMWVnMDFsdjJrczc2Mm12Y3QyNyJ9.J1I-1msTs5pOeccQAuQ4yg';
mapboxgl.accessToken = MAPBOX_TOKEN;

interface Place {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  description: string;
  category?: string;
  image?: string;
}

// Basic seed data (can later be loaded from backend / JSON)
const places: Place[] = [
  {
    id: 'colosseo',
    name: 'Colosseo',
    coords: [12.4922, 41.8902],
    description: 'Anfiteatro Flavio: simbolo di Roma antica e storia millenaria dei gladiatori.',
    category: 'Storico',
    image: '/mock/roma-fans-1.jpg'
  },
  {
    id: 'olimpico',
    name: 'Stadio Olimpico',
    coords: [12.4547, 41.9339],
    description: 'Casa delle grandi notti europee giallorosse e teatro della passione romanista.',
    category: 'Calcio',
    image: '/mock/stadium-olimpico.jpg'
  },
  {
    id: 'trigoria',
    name: 'Centro Sportivo Trigoria',
    coords: [12.5756, 41.7803],
    description: 'Quartier generale della AS Roma: allenamenti, tattica e futuro del club.',
    category: 'Club'
  },
  {
    id: 'piazza_del_popolo',
    name: 'Piazza del Popolo',
    coords: [12.4768, 41.9109],
    description: 'Uno dei punti di ritrovo dei tifosi nelle giornate speciali.',
    category: 'Ritrovo'
  }
];

const markerColors: Record<string, string> = {
  Storico: 'bg-amber-500',
  Calcio: 'bg-roma-red',
  Club: 'bg-roma-gold',
  Ritrovo: 'bg-roma-yellow'
};

const RomaMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/furieromane/cmeeejl8900iu01s62io48hha',
      center: [12.4922, 41.8902], // start near Colosseo
      zoom: 11
    });

    mapRef.current.once('load', () => {
      setIsMapLoaded(true);
    });
  }, []);

  // Add markers when map is ready
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    places.forEach(place => {
      const el = document.createElement('button');
      el.className = `group relative rounded-full border border-white shadow-lg w-6 h-6 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${markerColors[place.category || ''] || 'bg-roma-red'} `;
      el.title = place.name;
      el.innerHTML = '<span class="sr-only">' + place.name + '</span>';
      el.addEventListener('click', () => {
        setSelected(place);
        // Smooth fly to location
        mapRef.current?.flyTo({ center: place.coords, zoom: 13, speed: 0.8 });
      });
      new mapboxgl.Marker(el).setLngLat(place.coords).addTo(mapRef.current!);
    });

    return () => {
      // Note: markers are not stored for cleanup; ok for simple demo
    };
  }, [isMapLoaded]);

  // Resize map when panel opens
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current?.resize();
    }, 300);
  }, [selected]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div
          ref={mapContainerRef}
          className="relative w-full aspect-square md:aspect-auto md:flex-1 md:h-[500px] rounded-lg overflow-hidden border border-border/50 shadow-roma bg-muted"
        >
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Caricamento mappa...
            </div>
          )}
        </div>

        {/* Side panel (desktop) */}
        {selected && (
          <div className="hidden md:flex w-[380px] flex-col border border-border/50 rounded-lg bg-background/80 backdrop-blur p-4 shadow-roma animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-foreground">{selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-xs px-2 py-1 rounded bg-foreground text-background hover:opacity-80"
              >
                Chiudi
              </button>
            </div>
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">{selected.description}</p>
            {selected.category && (
              <span className="inline-block text-xs font-medium px-2 py-1 bg-roma-red text-white rounded">
                {selected.category}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile panel (below) */}
      {selected && (
        <div className="md:hidden mt-4 border border-border/50 rounded-lg p-4 bg-background/80 backdrop-blur shadow-roma animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
            <button
              onClick={() => setSelected(null)}
              className="text-xs px-2 py-1 rounded bg-foreground text-background hover:opacity-80"
            >
              Chiudi
            </button>
          </div>
          {selected.image && (
            <img
              src={selected.image}
              alt={selected.name}
              className="w-full h-40 object-cover rounded mb-3"
            />
          )}
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">{selected.description}</p>
          {selected.category && (
            <span className="inline-block text-xs font-medium px-2 py-1 bg-roma-red text-white rounded">
              {selected.category}
            </span>
          )}
        </div>
      )}

      {/* Helper hint */}
      <p className="mt-4 text-xs text-muted-foreground">
        Clicca sui marcatori per scoprire i luoghi giallorossi. (Demo dati statici)
      </p>
    </div>
  );
};

export default RomaMap;