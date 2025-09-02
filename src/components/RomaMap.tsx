import React from 'react';
import { MapPin } from 'lucide-react';

// TODO: Temporaneamente disabilitato - rimuovere completamente la mappa esistente
// Per la futura reimplementazione:
// - Ripristinare mapbox-gl import e configurazione
// - Riaggiungere tutti gli hook useState, useEffect, useRef
// - Ripristinare romaPlaces data, markers, filtri
// - Riimplementare logica mobile/desktop
// - VITE_MAPBOX_TOKEN è disponibile in .env per uso futuro
// - Dipendenza mapbox-gl già presente in package.json

const RomaMap = () => {
  // TODO: Futuro - ripristinare tutta la logica di stato e mapping qui
  // const mapContainer = useRef<HTMLDivElement>(null);
  // const map = useRef<mapboxgl.Map | null>(null);
  // const [selectedPlace, setSelectedPlace] = useState<any>(null);
  // const [isMobile, setIsMobile] = useState(false);
  // ... etc

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Placeholder che mantiene la struttura layout esistente */}
      <div className="flex flex-col h-full">
        {/* Header placeholder */}
        <div className="bg-background/95 backdrop-blur-sm p-3 border-b border-border/50 z-30 flex-shrink-0">
          <h2 className="text-lg font-semibold text-roma-gold text-center">Mappa di Roma - In Aggiornamento</h2>
        </div>
        
        {/* Main content placeholder */}
        <div className="flex-1 flex items-center justify-center min-h-[400px] md:min-h-[500px]">
          <div className="relative w-full h-full rounded-lg overflow-hidden shadow-roma border border-border/50 bg-gradient-to-br from-roma-red/5 via-roma-yellow/5 to-roma-gold/5">
            {/* Placeholder content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="mb-6">
                  <MapPin className="w-16 h-16 mx-auto text-roma-gold mb-4" />
                  <h3 className="text-2xl font-bold text-roma-gold mb-2">Mappa Temporaneamente Non Disponibile</h3>
                  <p className="text-muted-foreground mb-4">
                    Stiamo lavorando per migliorare l'esperienza della mappa interattiva di Roma.
                  </p>
                  <div className="text-sm text-muted-foreground/80">
                    <p>La mappa tornerà presto con:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Luoghi storici di Roma</li>
                      <li>• Pub e locali per tifosi</li>
                      <li>• Stadi e luoghi Roma</li>
                      <li>• Quartieri romanisti</li>
                    </ul>
                  </div>
                </div>
                
                {/* Loading animation placeholder */}
                <div className="animate-pulse flex space-x-1 justify-center">
                  <div className="w-2 h-2 bg-roma-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-roma-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-roma-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RomaMap;