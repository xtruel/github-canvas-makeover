/**
 * MapWithLanguage component - Basic Mapbox map centered on Rome with language note
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Info, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useT } from '@/i18n/useT';

interface MapWithLanguageProps {
  className?: string;
  height?: string;
  showLanguageNote?: boolean;
  zoom?: number;
}

export function MapWithLanguage({ 
  className = '',
  height = '400px',
  showLanguageNote = true,
  zoom = 12
}: MapWithLanguageProps) {
  const { t, getSection } = useT();
  const mapStrings = getSection('map');
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rome coordinates (Colosseum area)
  const ROME_CENTER: [number, number] = React.useMemo(() => [12.4924, 41.8902], []);
  
  // Mapbox access token - this should be set in environment variables
  const MAPBOX_TOKEN = 'pk.eyJ1IjoieHRydWVsIiwiYSI6ImNqYTJyMm1hMzM2NTYzM3FrMW9uZWUzYm8ifQ.fT1dOlvZ2VAXgn_ySBuEzw';

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Initialize map
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: ROME_CENTER,
        zoom: zoom,
        language: 'it', // Set Italian language for map labels
        attributionControl: true,
      });

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker for Rome center
      new mapboxgl.Marker({
        color: '#C8102E', // Roma red
        scale: 1.2
      })
        .setLngLat(ROME_CENTER)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div class="text-center"><strong>Roma</strong><br/>Caput Mundi</div>')
        )
        .addTo(mapInstance);

      // Handle map load
      mapInstance.on('load', () => {
        setIsLoading(false);
      });

      // Handle map errors
      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        setError(mapStrings.error);
        setIsLoading(false);
      });

      map.current = mapInstance;

      // Cleanup function
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError(mapStrings.error);
      setIsLoading(false);
    }
  }, [zoom, mapStrings.error, ROME_CENTER]);

  return (
    <div className={`relative ${className}`}>
      {/* Language note */}
      {showLanguageNote && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            La mappa è configurata per visualizzare le etichette in italiano. 
            Questa è una mappa base centrata su Roma che può essere estesa con punti di interesse romanisti.
          </AlertDescription>
        </Alert>
      )}

      {/* Map container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative" style={{ height }}>
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roma-red mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">{mapStrings.loading}</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Map container div */}
            <div 
              ref={mapContainer} 
              className="w-full h-full"
              style={{ 
                minHeight: height,
                visibility: isLoading || error ? 'hidden' : 'visible'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Map attribution */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>
          Mappa fornita da Mapbox. 
          <a 
            href="https://www.mapbox.com/about/maps/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-roma-red ml-1"
          >
            © Mapbox
          </a>
          {' | '}
          <a 
            href="https://www.openstreetmap.org/copyright" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-roma-red"
          >
            © OpenStreetMap
          </a>
        </p>
      </div>
    </div>
  );
}