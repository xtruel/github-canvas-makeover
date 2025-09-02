import React from 'react';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

const RomaMapPlaceholder = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-roma-red/10 to-roma-gold/10 overflow-hidden">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm p-3 border-b border-border/50 z-30">
        <h2 className="text-lg font-semibold text-roma-gold text-center">Discover the Eternal City</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">Interactive map coming soon</p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[400px]">
        {/* Map Icon */}
        <div className="mb-6 p-4 rounded-full bg-roma-gold/20 border-2 border-roma-gold/30">
          <MapPin className="w-12 h-12 text-roma-gold" />
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Roma Interactive Map</h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Explore historic landmarks, stadiums, and romanista gathering places across the Eternal City.
        </p>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50 text-center">
            <MapPin className="w-6 h-6 text-roma-gold mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Historic Sites</h4>
            <p className="text-xs text-muted-foreground">Colosseum, Pantheon, Vatican and more</p>
          </div>
          
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50 text-center">
            <Users className="w-6 h-6 text-roma-gold mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Fan Zones</h4>
            <p className="text-xs text-muted-foreground">Bars, clubs and romanista meetups</p>
          </div>
          
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50 text-center">
            <Calendar className="w-6 h-6 text-roma-gold mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Stadiums</h4>
            <p className="text-xs text-muted-foreground">Olimpico and training facilities</p>
          </div>
        </div>
        
        {/* Coming Soon Badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-roma-gold/20 border border-roma-gold/30 rounded-full">
          <Clock className="w-4 h-4 text-roma-gold" />
          <span className="text-sm font-medium text-roma-gold">Interactive features coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default RomaMapPlaceholder;