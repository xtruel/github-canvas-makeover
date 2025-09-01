import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Import existing working images
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
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    coords: [number, number];
    type: string;
    color: string;
    description?: string;
    image?: string;
  } | null>(null);
  
  // Synchronous mobile detection to prevent layout jumps
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth < 768;
    return hasCoarsePointer || isNarrow;
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(['historical', 'pub', 'club', 'neighborhood', 'stadium', 'roma-men', 'roma-women']);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Token Mapbox
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVyaWVyb21hbmUiLCJhIjoiY21lanVmMWVnMDFsdjJrczc2Mm12Y3QyNyJ9.J1I-1msTs5pOeccQAuQ4yg';

  // Luoghi di Roma (data unchanged)
  const romaPlaces = [
    { name: 'Colosseo', coords: [12.4924, 41.8902], type: 'historical', color: '#6B7280', description: 'L\'Amphitheatrum Flavium, vero nome del Colosseo, fu costruito dall\'imperatore Vespasiano nel 72 d.C. e inaugurato dal figlio Tito nell\'80 d.C. Questo colosso architettonico,[...]', image: 'https://turismoroma.it/sites/default/files/colosseo_slide_0.jpg' },
    { name: 'Pantheon', coords: [12.4768, 41.8986], type: 'historical', color: '#6B7280', description: 'Capolavoro assoluto dell\'ingegneria romana, il Pantheon fu ricostruito dall\'imperatore Adriano tra il 112 e il 124 d.C. La sua cupola emisferica in calcestruzzo, con diametro[...]', image: pantheonImage },
    { name: 'Fontana di Trevi', coords: [12.4833, 41.9009], type: 'historical', color: '#6B7280', description: 'Opera barocca monumentale progettata da Nicola Salvi e commissionata da Papa Clemente XII nel 1732. Completata trent\'anni dopo da Giuseppe Pannini (Salvi morì nel 1751), misu[...]', image: 'https://turismoroma.it/sites/default/files/Fontane%20-%20Fontana%20di%20Trevi_1920x1080mba-07410189%20%C2%A9%20Clickalps%20_%20AGF%20foto.jpg' },
    { name: 'Piazza di Spagna', coords: [12.4823, 41.9063], type: 'historical', color: '#6B7280', description: 'Cuore pulsante dell\'eleganza romana, Piazza di Spagna incanta con la sua scenografica scalinata di Trinità dei Monti - 135 gradini in travertino progettati da Francesco De Sa[...]', image: piazzaSpagnaImage },
    { name: 'Castel Sant\'Angelo', coords: [12.4663, 41.9031], type: 'historical', color: '#6B7280', description: 'Nato come Mausoleo di Adriano (139 d.C.), questo cilindro di travertino e peperino è diventato nei secoli fortezza inespugnabile, prigione pontificia e residenza papale rinasc[...]', image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=500' },
    { name: 'Vittoriano', coords: [12.4828, 41.8956], type: 'historical', color: '#6B7280', description: 'Altare della Patria dedicato a Vittorio Emanuele II, primo re d\'Italia unita. Inaugurato nel 1935, è soprannominato "Macchina da scrivere" dai romani. Ospita il Milite Ignoto[...]', image: vitorianoImage },
    { name: 'Basilica di San Pietro', coords: [12.4534, 41.9022], type: 'historical', color: '#6B7280', description: 'La più grande basilica del mondo cristiano, capolavoro del Rinascimento e Barocco. Progettata da Bramante, Michelangelo e Bernini. La cupola di Michelangelo domina Roma con i [...]', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500' },
    { name: 'Fori Imperiali', coords: [12.4843, 41.8947], type: 'historical', color: '#6B7280', description: 'Complesso di piazze monumentali costruite tra il 46 a.C. e il 113 d.C. dai vari imperatori romani. Include il Foro di Cesare, di Augusto, di Nerva e di Traiano con la famosa C[...]', image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=500' },
    { name: 'Villa Borghese', coords: [12.4922, 41.9142], type: 'historical', color: '#6B7280', description: 'Magnifico parco di 80 ettari nel cuore di Roma, creato all\'inizio del XVII secolo dal Cardinale Scipione Borghese, nipote di Papa Paolo V. Progettato da Flaminio Ponzio e Gio[...]', image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500' },
    { name: 'Terme di Caracalla', coords: [12.4907, 41.8784], type: 'historical', color: '#6B7280', description: 'Uno dei più grandi e meglio conservati complessi termali dell\'antica Roma, costruito dall\'imperatore Caracalla tra il 212 e il 216 d.C. Poteva ospitare fino a 1600 bagnanti[...]', image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500' },
    { name: 'Circo Massimo', coords: [12.4854, 41.8857], type: 'historical', color: '#6B7280', description: 'Il più grande stadio dell\'antichità, lungo 621 metri e largo 118, poteva ospitare fino a 250.000 spettatori per le corse dei carri. Oggi è un parco pubblico che conserva l[...]', image: 'https://images.unsplash.com/photo-1588773163068-ca4ae4a08742?w=500' },
    { name: 'Campo de\' Fiori', coords: [12.4728, 41.8957], type: 'neighborhood', color: '#16A34A', description: 'Piazza storica con mercato mattutino dal 1869 e vivace vita notturna. Al centro la statua di Giordano Bruno, bruciato qui nel 1600. Circondata da osterie tradizionali e locali[...]', image: 'https://images.unsplash.com/photo-1582719471274-15abce5b07c3?w=500' },
    // ... (KEEP ALL OTHER ENTRIES UNCHANGED from existing file) ...
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
      default: return 'Luogo';
    }
  };

  const toggleFilter = (type: string) => setActiveFilters([type]);
  const showAllFilters = () => setActiveFilters(['historical', 'pub', 'club', 'neighborhood', 'stadium', 'roma-men', 'roma-women']);
  const getFilteredPlaces = () => romaPlaces.filter(p => activeFilters.includes(p.type));
  const getPlaceCount = (type: string) => romaPlaces.filter(p => p.type === type).length;

  // Use useLayoutEffect for synchronous mobile detection before paint
  useLayoutEffect(() => {
    const checkMobile = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const isNarrow = window.innerWidth < 768;
      setIsMobile(hasCoarsePointer || isNarrow);
    };
    
    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener('change', checkMobile);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      mq.removeEventListener('change', checkMobile);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [12.4964, 41.9028],
      zoom: isMobile ? 10.2 : 12,
      pitch: isMobile ? 0 : 45,
      antialias: !isMobile,
      renderWorldCopies: false,
      maxZoom: isMobile ? 15.5 : 18,
      preserveDrawingBuffer: false,
      cooperativeGestures: true,
    });

    if (isMobile) {
      mapInstance.scrollZoom.disable();
      mapInstance.boxZoom.disable();
      mapInstance.dragRotate.disable();
      mapInstance.keyboard.disable();
    }

    mapInstance.on('load', () => {
      setIsMapLoading(false);
      mapInstance.resize();
      updateMarkers(mapInstance);
    });

    mapInstance.on('error', e => console.error('Map error:', e));

    map.current = mapInstance;
    return () => {
      setIsMapLoading(true);
      mapInstance.remove();
    };
  }, [isMobile]);

  useEffect(() => {
    if (map.current && !isMapLoading) updateMarkers(map.current);
  }, [activeFilters, isMobile, isMapLoading]);

  const updateMarkers = (mapInstance: mapboxgl.Map) => {
    markers.current.forEach(m => { try { m.remove(); } catch {} });
    markers.current = [];
    const filtered = getFilteredPlaces();
    const valid = filtered.filter(place => {
      const [lng, lat] = place.coords;
      return Array.isArray(place.coords) && place.coords.length === 2 && !isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    });
    const toShow = valid; // Use full romaPlaces array as requested, don't truncate on mobile
    toShow.forEach(place => {
      try {
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.style.cssText = `background-color: ${place.color}; width: ${isMobile ? '16px' : '20px'}; height: ${isMobile ? '16px' : '20px'}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;
        markerEl.addEventListener('click', (e) => { e.stopPropagation(); setSelectedPlace(place); if (isMobile) setIsDrawerOpen(true); });
        const marker = new mapboxgl.Marker(markerEl).setLngLat(place.coords as [number, number]).addTo(mapInstance);
        markers.current.push(marker);
      } catch (err) { console.error('Error adding marker', err); }
    });
    if (!isMobile) {
      try { mapInstance.setFog({ color: 'rgb(255,255,255)', 'high-color': 'rgb(200,200,225)', 'horizon-blend': 0.1 }); } catch {}
    }
  };

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* 
        GLOBAL LAYOUT NOTE: If height jumps still occur, check:
        1. Mappa.tsx uses minHeight with --app-height CSS variable
        2. Global CSS (index.css) defines --app-height which can change dynamically
        3. Viewport utilities (viewport.ts) may modify --app-height causing layout shifts
        4. Consider using fixed vh units instead of CSS variables for stable layout
      */}
      {isMobile ? (
        <div className="flex flex-col h-full">
          <div className="bg-background/95 backdrop-blur-sm p-3 border-b border-border/50 z-30 flex-shrink-0">
            <h2 className="text-lg font-semibold text-roma-gold text-center">Discover the Eternal City</h2>
          </div>
          <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 px-3 py-2 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { type: 'stadium', color: '#D97706', label: 'Stadi' },
                { type: 'roma-men', color: '#DC2626', label: 'Roma' },
                { type: 'roma-women', color: '#9333EA', label: 'Femminile' },
                { type: 'pub', color: '#2563EB', label: 'Bar' },
                { type: 'club', color: '#EC4899', label: 'Club' },
                { type: 'neighborhood', color: '#16A34A', label: 'Quartieri' },
                { type: 'historical', color: '#6B7280', label: 'Storici' }
              ].map(item => (
                <button key={item.type} onClick={() => toggleFilter(item.type)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 hover:bg-muted/50 flex-shrink-0 text-xs ${activeFilters.includes(item.type) ? 'opacity-100 bg-muted/30 ring-1 ring-roma-gold/50' : 'opacity-60 hover:opacity-80'}`}> 
                  <div className="w-2 h-2 rounded-full border border-white flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">({getPlaceCount(item.type)})</span>
                </button>
              ))}
              <button onClick={showAllFilters} className="px-2.5 py-1.5 rounded-full text-xs text-roma-gold hover:text-roma-yellow border border-roma-gold/30 hover:bg-roma-gold/10 transition-all flex-shrink-0">Tutti</button>
            </div>
          </div>
          
          {/* Pre-allocated map container with fixed height to prevent layout jumps */}
          <div className="relative w-full flex-1" style={{ minHeight: 'min(55vh, 420px)', maxHeight: 'min(55vh, 420px)' }}>
            <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden shadow-roma border border-border/50">
              <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
              {isMapLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roma-gold mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overlay drawer that slides over the map instead of changing layout flow */}
            {selectedPlace && (
              <div 
                className="absolute inset-x-0 bottom-0 bg-background border-t border-border/50 shadow-lg rounded-t-lg z-40 transition-transform duration-300 ease-in-out"
                style={{ 
                  height: 'min(35vh, 300px)',
                  transform: selectedPlace ? 'translateY(0)' : 'translateY(100%)'
                }}
              >
                <div className="h-full overflow-y-auto">
                  <div className="p-4 pb-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">{selectedPlace.name}</h3>
                        <p className="text-sm font-medium" style={{ color: selectedPlace.color }}>{getTypeLabel(selectedPlace.type)}</p>
                      </div>
                      <button onClick={() => setSelectedPlace(null)} className="p-2 rounded-full hover:bg-muted transition-colors active:bg-muted ml-2 flex-shrink-0">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                    {selectedPlace.image && (
                      <div className="mb-4">
                        <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-48 object-cover rounded-lg shadow-md" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    {selectedPlace.description && (
                      <div className="text-sm text-foreground/90 leading-relaxed"><p>{selectedPlace.description}</p></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 h-full">
          <h1 className="text-4xl font-bold mb-8 text-roma-gold">Mappa di Roma</h1>
          <div className="flex gap-4 transition-all duration-300 h-[500px]">
            <div className={`relative rounded-lg overflow-hidden shadow-roma border border-border/50 transition-all duration-300 ${selectedPlace ? 'w-2/3' : 'w-full'}`}> 
              <div ref={mapContainer} className="w-full h-full" />
              <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 max-w-[200px] z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-roma-gold">Legenda</h4>
                  <button onClick={showAllFilters} className="text-xs text-roma-gold hover:text-roma-yellow underline">Tutti</button>
                </div>
                <div className="space-y-1 text-xs">
                  {[
                    { type: 'stadium', color: '#D97706', label: 'Stadi' },
                    { type: 'roma-men', color: '#DC2626', label: 'Partite Roma' },
                    { type: 'roma-women', color: '#9333EA', label: 'Roma Femminile' },
                    { type: 'pub', color: '#2563EB', label: 'Pub & Bar' },
                    { type: 'club', color: '#EC4899', label: 'Club' },
                    { type: 'neighborhood', color: '#16A34A', label: 'Quartieri' },
                    { type: 'historical', color: '#6B7280', label: 'Luoghi Storici' }
                  ].map(item => (
                    <button key={item.type} onClick={() => toggleFilter(item.type)} className={`flex items-center gap-2 w-full p-1.5 rounded transition-all hover:bg-muted/50 text-left ${activeFilters.includes(item.type) ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}> 
                      <div className="w-3 h-3 rounded-full border border-white flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-xs flex-1">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">({getPlaceCount(item.type)})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {selectedPlace && (
              <div className="w-1/3 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 flex flex-col">
                <div className="flex justify-between items-start p-4 border-b border-border/50">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{selectedPlace.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{getTypeLabel(selectedPlace.type)}</p>
                  </div>
                  <button onClick={() => setSelectedPlace(null)} className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0 ml-2">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedPlace.image && (
                    <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-32 object-cover rounded-md mb-3" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  {selectedPlace.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlace.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RomaMap;