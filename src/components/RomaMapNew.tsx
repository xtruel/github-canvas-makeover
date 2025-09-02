import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { places, Place } from '../data/places';

// Mapbox token from env (do not hardcode production keys)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'REPLACE_ME_WITH_ENV_TOKEN';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Allow overriding the style via env var; fallback to a public, always-available style
// (streets-v12 is stable and ideal for connectivity tests)
const MAP_STYLE = (import.meta.env.VITE_MAPBOX_STYLE as string) || 'mapbox://styles/mapbox/streets-v12';

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
  marker: mapboxgl.Marker;
  element: HTMLButtonElement;
}

const RomaMapNew: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(Array.from(new Set(places.map(p => p.category).filter(Boolean) as string[]))));

  // Simple error state
  const [errorMessage, setErrorMessage] = useState<string | null>(
    MAPBOX_TOKEN.includes('REPLACE_ME_WITH_ENV_TOKEN') ? 'Token Mapbox mancante. Imposta VITE_MAPBOX_TOKEN.' : null
  );

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Prepare categories
  const allCategories = Array.from(new Set(places.map(p => p.category).filter(Boolean) as string[])).sort();

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // Filter by category first
  const categoryFiltered = places.filter(p => !p.category || activeCategories.has(p.category));

  // Search filtering (non destructive, just restrict markers & suggestions)
  const sq = searchQuery.trim().toLowerCase();
  const searchFiltered = sq.length > 0
    ? categoryFiltered.filter(p => p.name.toLowerCase().includes(sq) || p.description.toLowerCase().includes(sq))
    : categoryFiltered;

  const suggestions = sq.length > 1
    ? categoryFiltered
        .filter(p => p.name.toLowerCase().includes(sq) || p.description.toLowerCase().includes(sq))
        .slice(0, 8)
    : [];

  const buildMarkers = useCallback(() => {
    if (!mapRef.current) return;
    // Remove existing markers
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
      const marker = new mapboxgl.Marker(btn).setLngLat(place.coords).addTo(mapRef.current!);
      markersRef.current.push({ place, marker, element: btn });
    });
  }, [searchFiltered, selected]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current || errorMessage) return;

    try {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [12.4922, 41.8902], // Central Rome
        zoom: 11,
        pitchWithRotate: false,
        dragRotate: false,
        attributionControl: true
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current.once('load', () => setIsLoaded(true));
      mapRef.current.on('error', (e) => {
        // Mapbox sometimes emits { error: { message }}
        const msg = (e?.error && (e.error.message || e.error.statusText)) || 'Errore generico caricamento mappa';
        console.error('Mapbox error:', msg, e);
        if (!errorMessage) setErrorMessage(msg);
      });
    } catch (err: any) {
      console.error('Map init failed', err);
      setErrorMessage(err?.message || 'Impossibile inizializzare la mappa');
    }
  }, [errorMessage]);

  // Rebuild markers when loaded / filters / search / selected highlight changes
  useEffect(() => {
    if (!isLoaded || errorMessage) return;
    buildMarkers();
  }, [isLoaded, buildMarkers, errorMessage]);

  // Resize handling for mobile orientation / container size
  useEffect(() => {
    const map = mapRef.current; const container = containerRef.current; if (!map || !container) return;
    const handleResize = () => { map.resize(); };
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

  // ESC closes panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Search keyboard navigation
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

  return (
    <div className="relative w-full h-[60vh] min-h-[420px] rounded-lg overflow-hidden border border-border/50 shadow-roma bg-muted">
      <div ref={containerRef} className="absolute inset-0" />
      {!isLoaded && !errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm text-muted-foreground backdrop-blur-sm bg-background/40">
          Caricamento mappa...
        </div>
      )}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-[11px] md:text-sm bg-background/85 backdrop-blur">
          <p className="font-semibold">Errore mappa</p>
          <p className="text-muted-foreground break-words max-w-xs">{errorMessage}</p>
          <div className="flex gap-2">
            {!MAPBOX_TOKEN.includes('REPLACE_ME_WITH_ENV_TOKEN') && (
              <button
                className="px-3 py-1 rounded bg-foreground text-background text-xs hover:opacity-80"
                onClick={() => { setErrorMessage(null); mapRef.current?.reload(); }}
              >Riprova</button>
            )}
            {MAPBOX_TOKEN.includes('REPLACE_ME_WITH_ENV_TOKEN') && (
              <a
                className="px-3 py-1 rounded bg-foreground text-background text-xs hover:opacity-80"
                target="_blank" rel="noopener noreferrer"
                href="https://account.mapbox.com/access-tokens/"
              >Crea token</a>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Style: {MAP_STYLE}</p>
        </div>
      )}

      {/* Top-left controls wrapper */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 max-w-[75%] z-[5] pointer-events-none">
        {/* Search Bar */}
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
              disabled={!!errorMessage}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                aria-label="Pulisci ricerca"
                className="absolute right-1 top-1 text-[10px] px-1 rounded bg-foreground/80 text-background hover:bg-foreground"
              >×</button>
            )}
            {suggestions.length > 0 && !errorMessage && (
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

        {/* Category Filters */}
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
                  disabled={!!errorMessage}
                >{meta.label}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop side panel */}
      {selected && !errorMessage && (
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

      {/* Mobile bottom sheet */}
      <div className={[
        'md:hidden pointer-events-none absolute left-0 right-0 bottom-0 px-2 pb-[env(safe-area-inset-bottom)] transition-transform duration-300',
        selected && !errorMessage ? 'translate-y-0' : 'translate-y-[calc(100%_-_44px)]'
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

      {/* Footer hint */}
      <div className="absolute bottom-2 left-2 text-[10px] md:text-xs px-2 py-1 rounded bg-background/70 backdrop-blur border border-border/50 text-muted-foreground pointer-events-none">
        {errorMessage ? 'Impossibile caricare la mappa.' : 'Tocca un marcatore o cerca un luogo. Dati statici demo.'}
      </div>
    </div>
  );
};

export default RomaMapNew;