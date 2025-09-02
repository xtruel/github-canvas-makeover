import React from 'react';
import { MapPin, Calendar, Users } from 'lucide-react';

const MapPlaceholder = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-roma-red/10 via-background to-roma-gold/5 overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        <div className="bg-background/95 backdrop-blur-sm p-3 border-b border-border/50 z-30 flex-shrink-0">
          <h2 className="text-lg font-semibold text-roma-gold text-center">Discover the Eternal City</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-roma-gold/20 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-roma-gold" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Mappa Temporaneamente Non Disponibile</h3>
            <p className="text-muted-foreground max-w-sm">
              La mappa interattiva è stata temporaneamente rimossa. Tornerà presto con nuove funzionalità!
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Eventi</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block container mx-auto px-4 py-8 h-full">
        <h1 className="text-4xl font-bold mb-8 text-roma-gold">Mappa di Roma</h1>
        <div className="h-[500px] rounded-lg overflow-hidden shadow-roma border border-border/50 bg-gradient-to-br from-roma-red/5 via-background to-roma-gold/10">
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-lg">
              <div className="w-24 h-24 mx-auto bg-roma-gold/20 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-roma-gold" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Mappa Temporaneamente Non Disponibile</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                La mappa interattiva è stata temporaneamente rimossa per ottimizzazioni. 
                Tornerà presto con nuove funzionalità e miglioramenti per l'esperienza utente!
              </p>
              <div className="flex justify-center space-x-8 pt-6">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-roma-gold" />
                  <span>Trova Eventi</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Users className="w-5 h-5 text-roma-gold" />
                  <span>Unisciti alla Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;