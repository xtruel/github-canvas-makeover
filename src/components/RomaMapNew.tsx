import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css'; // keep CSS for styling (still small)
import { places, Place } from '../data/places';

// Environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
const MAP_STYLE = (import.meta.env.VITE_MAPBOX_STYLE as string) || 'mapbox://styles/mapbox/streets-v12';

// We'll load mapbox-gl lazily only if needed
type MapboxModule = typeof import('mapbox-gl');
let mapboxglRef: MapboxModule | null = null;

// Category color metadata
const categoryStyles: Record<string, { colorClass: string; label: string }> = {
  Storico: { colorClass: 'bg-amber-600', label: 'Storico' },
  Monumento: { colorClass: 'bg-orange-600', label: 'Monumento' },
  Arte: { colorClass: 'bg-purple-600', label: 'Arte' },
  Religioso: { colorClass: 'bg-indigo-600', label: 'Religioso' },
  Sport: { colorClass: 'bg-red-600', label: 'Sport' },
  Club: { colorClass: 'bg-yellow-600', label: 'Club' },
  Ritrovo: { colorClass: 'bg-rose-600', label: 'Ritrovo' },
  Natura: { colorClass: 'bg-green-600', label: 'Natura' }
};

interface MarkerHandle {
  place: Place;
  marker: any;
  element: HTMLButtonElement;
}

const RomaMapNew: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const [shouldLoadLib, setShouldLoadLib] = useState(false);
  const [libLoaded, setLibLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selected, setSelected] = useState<Place | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>( 
    () => new Set(Array.from(new Set(places.map(p => p.category).filter(Boolean) as string[])))
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    !MAPBOX_TOKEN ? 'Mapbox token assente. Imposta VITE_MAPBOX_TOKEN.' : null
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const allCategories = Array.from(new Set(places.map(p => p.category).filter(Boolean) as string[])).sort();

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const categoryFiltered = places.filter(p => !p.category || activeCategories.has(p.category));
  const sq = searchQuery.trim().toLowerCase();
  const searchFiltered = sq
    ? categoryFiltered.filter(p => p.name.toLowerCase().includes(sq) || p.description.toLowerCase().includes(sq))
    : categoryFiltered;

  const suggestions = sq.length > 1
    ? categoryFiltered
        .filter(p => p.name.toLowerCase().includes(sq) || p.description.toLowerCase().includes(sq))
        .slice(0, 8)
    : [];

  // IntersectionObserver to trigger lazy loading
  useEffect(() => {
    if (!containerRef.current || shouldLoadLib || !MAPBOX_TOKEN) return;
    ioRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setShouldLoadLib(true);
          ioRef.current?.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    ioRef.current.observe(containerRef.current);
    return () => ioRef.current?.disconnect();
  }, [shouldLoadLib]);

  // Dynamically import mapbox-gl
  useEffect(() => {
    if (!shouldLoadLib || !MAPBOX_TOKEN || libLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('mapbox-gl');
        if (cancelled) return;
        mapboxglRef = mod;
        mapboxglRef.accessToken = MAPBOX_TOKEN;
        setLibLoaded(true);
      } catch (err: any) {
        if (!cancelled) setErrorMessage(err?.message || 'Impossibile caricare la libreria Mapbox');
      }
    })();
    return () => { cancelled = true; };
  }, [shouldLoadLib, libLoaded]);

  // Build markers
  const buildMarkers = useCallback(() => {
    if (!mapRef.current || !mapboxglRef) return;
    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];

    searchFiltered.forEach(place => {
      const btn = document.createElement('button');
      const cat = place.category || 'Altro';
      const meta = categoryStyles[cat] || { colorClass: 'bg-red-700', label: cat };
      btn.type = 'button';
      btn.className = [
        'group rounded-full border border-white/70 shadow-md w-7 h-7 flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
        'transition-transform hover:scale-110',
        selected?.id === place.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
      ].join(' ');
      btn.setAttribute('aria-label', place.name);
      btn.tabIndex = 0;
      btn.addEventListener('click', () => {
        setSelected(place);
        requestAnimationFrame(() => {
          mapRef.current?.flyTo({ center: place.coords, zoom: 14, speed: 0.8, essential: true });
        });
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
      const marker = new mapboxglRef!.Marker(btn).setLngLat(place.coords).addTo(mapRef.current);
      markersRef.current.push({ place, marker, element: btn });
    });
  }, [searchFiltered, selected]);

  // Init map after lib load
  useEffect(() => {
    if (!libLoaded || mapRef.current || errorMessage || !MAPBOX_TOKEN || !containerRef.current || !mapboxglRef) return;
    try {
      mapRef.current = new mapboxglRef.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [12.4922, 41.8902],
        zoom: 11,
        pitchWithRotate: false,
        dragRotate: false,
        attributionControl: true
      });
      mapRef.current.addControl(new mapboxglRef.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current.once('load', () => setIsLoaded(true));
      mapRef.current.on('error', (e: any) => {
        const msg = (e?.error && (e.error.message || e.error.statusText)) || 'Errore generico caricamento mappa';
        if (!errorMessage) setErrorMessage(msg);
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Impossibile inizializzare la mappa');
    }
  }, [libLoaded, errorMessage]);

  // Rebuild markers
  useEffect(() => {
    if (!isLoaded || errorMessage) return;
    buildMarkers();
  }, [isLoaded, buildMarkers, errorMessage]);

  // Resize handler
  useEffect(() => {
    const map = mapRef.current; const container = containerRef.current; if (!map || !container) return;
    const handleResize = () => map.resize();
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserverRef.current?.disconnect();
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  // ESC to close panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keyboard navigation for search suggestions
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current) return;
      if (!suggestions.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex(i => (i + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex(i => (i - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          e.preventDefault();
            const place = suggestions[highlightIndex];
            setSelected(place);
            setSearchQuery(place.name);
            setHighlightIndex(-1);
            mapRef.current?.flyTo({ center: place.coords, zoom: 14, speed: 0.9 });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [suggestions, highlightIndex]);

  const onSelectSuggestion = (place: Place) => {
    setSelected(place);
    setSearchQuery(place.name);
    setHighlightIndex(-1);
    mapRef.current?.flyTo({ center: place.coords, zoom: 14, speed: 0.9 });
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  const missingToken = !MAPBOX_TOKEN;
  const showMapViewport = !missingToken && shouldLoadLib;

  return (
    <div className="relative w-full h-[60vh] min-h-[420px] rounded-lg overflow-hidden border border-border/50 shadow-roma bg-muted">
      <div ref={containerRef} className="absolute inset-0" />

      {showMapViewport && libLoaded && !isLoaded && !errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm text-muted-foreground backdrop-blur-sm bg-background/40">
          Caricamento mappa...
        </div>
      )}

      {missingToken && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center bg-background/85 backdrop-blur">
          <img
            src="/mock/stadium-olimpico.jpg"
            alt="Mappa statica di Roma - fallback"
            className="w-full h-48 object-cover rounded shadow"
            loading="lazy"
          />
          <p className="text-[11px] md:text-sm text-muted-foreground">
            Token Mapbox assente. Aggiungi VITE_MAPBOX_TOKEN per l'interattività.
          </p>
        </div>
      )}

      {!missingToken && errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-[11px] md:text-sm bg-background/85 backdrop-blur">
          <p className="font-semibold">Mappa non disponibile</p>
          <p className="text-muted-foreground break-words max-w-xs">{errorMessage}</p>
          <button
            className="px-3 py-1 rounded bg-foreground text-background text-xs hover:opacity-80"
            onClick={() => { setErrorMessage(null); mapRef.current?.reload?.(); }}
          >Riprova</button>
          <p className="text-[10px] text-muted-foreground">Style: {MAP_STYLE}</p>
        </div>
      )}

      {!errorMessage && !missingToken && (
        <div className="absolute top-2 left-2 flex flex-col gap-2 max-w-[75%] z-[5] pointer-events-none">
          <div className="pointer-events-auto w-[210px] md:w-[240px]">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setHighlightIndex(-1); }}
                placeholder="Cerca luogo..."
                className="w-full h-8 px-2 pr-7 rounded-md text-[12px] md:text-[13px] bg-background/80 backdrop-blur border border-border/60 focus:outline-none focus:ring-1 focus:ring-foreground/60"
                aria-label="Cerca luogo sulla mappa"
                disabled={!isLoaded}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  aria-label="Pulisci ricerca"
                  className="absolute right-1 top-1 text-[10px] px-1 rounded bg-foreground/80 text-background hover:bg-foreground"
                >×</button>
              )}
              {suggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="absolute mt-1 left-0 right-0 rounded-md overflow-hidden border border-border/60 bg-background/95 backdrop-blur shadow-xl text-[12px] max-h-56 overflow-y-auto z-10"
                  role="listbox"
                >
                  {suggestions.map((p, i) => {
                    const meta = p.category && categoryStyles[p.category];
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => onSelectSuggestion(p)}
                          onMouseEnter={() => setHighlightIndex(i)}
                          className={[
                            'flex w-full items-center justify-between gap-2 px-2 py-1 text-left transition',
                            i === highlightIndex ? 'bg-foreground text-background' : 'hover:bg-muted/70'
                          ].join(' ')}
                          role="option"
                          aria-selected={i === highlightIndex}
                        >
                          <span className="truncate">{p.name}</span>
                          {meta && (
                            <span
                              className={[
                                'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                i === highlightIndex ? 'bg-background text-foreground' : 'bg-foreground text-background'
                              ].join(' ')}
                            >
                              {meta.label}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="pointer-events-auto rounded-md bg-background/80 backdrop-blur p-2 border border-border/60 shadow">
            <p className="text-[10px] font-medium mb-1 uppercase tracking-wide text-muted-foreground">Filtra categorie</p>
            <div className="flex flex-wrap gap-1">
              {allCategories.map(cat => {
                const active = activeCategories.has(cat);
                const meta = categoryStyles[cat] || { colorClass: 'bg-slate-600', label: cat };
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={[
                      'px-2 py-1 rounded text-[11px] leading-none font-medium transition border',
                      active
                        ? `${meta.colorClass} text-white border-white/30`
                        : 'bg-background/60 text-foreground border-border/60 hover:bg-background/80'
                    ].join(' ')}
                    aria-pressed={active}
                    disabled={!isLoaded}
                  >{meta.label}</button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selected && !errorMessage && !missingToken && (
        <div className="hidden md:flex flex-col absolute top-0 right-0 h-full w-[340px] bg-gradient-to-br from-background/95 to-background/85 backdrop-blur-lg border-l border-border/50 shadow-xl">
          <div className="p-4 flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">{selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-xs px-2 py-1 rounded bg-foreground text-background hover:opacity-80">Chiudi</button>
          </div>
          <div className="px-4 pb-4 overflow-y-auto custom-scrollbar">
            {selected.image && (
              <img src={selected.image} alt={selected.name} className="w-full h-40 object-cover rounded mb-3" />
            )}
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">{selected.description}</p>
            {selected.category && (
              <span className="inline-block text-xs font-medium px-2 py-1 rounded bg-foreground text-background">{selected.category}</span>
            )}
          </div>
        </div>
      )}

      {selected && !errorMessage && !missingToken && (
        <div className={[
          'md:hidden pointer-events-none absolute left-0 right-0 bottom-0 px-2 pb-[env(safe-area-inset-bottom)] transition-transform duration-300',
          selected ? 'translate-y-0' : 'translate-y-[calc(100%_-_44px)]'
        ].join(' ')}>
          <div className="pointer-events-auto rounded-t-xl border border-border/60 bg-background/95 backdrop-blur p-4 shadow-roma">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold">{selected?.name}</h3>
              <button onClick={() => setSelected(null)} className="text-[10px] px-2 py-1 rounded bg-foreground text-background">Chiudi</button>
            </div>
            {selected?.image && (
              <img src={selected.image} alt={selected.name} className="w-full h-36 object-cover rounded mb-3" />
            )}
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-2">{selected?.description}</p>
            {selected?.category && (
              <span className="inline-block text-[11px] font-medium px-2 py-1 rounded bg-foreground text-background">{selected.category}</span>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 text-[10px] md:text-xs px-2 py-1 rounded bg-background/70 backdrop-blur border border-border/50 text-muted-foreground pointer-events-none">
        {missingToken
          ? 'Token mancante (fallback statico).'
          : errorMessage
          ? 'Impossibile caricare la mappa.'
          : 'Tocca un marcatore o cerca un luogo.'}
      </div>
    </div>
  );
};

export default RomaMapNew;