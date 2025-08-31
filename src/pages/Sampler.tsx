import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Music, Play, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { SamplerProvider, useSampler } from '@/features/sampler/state/SamplerContext';
import { PadGrid } from '@/features/sampler/components/PadGrid';
import { PadDetail } from '@/features/sampler/components/PadDetail';

function SamplerContent() {
  const { state, dispatch } = useSampler();
  const [selectedPadId, setSelectedPadId] = useState<number | null>(null);

  const handleMasterGainChange = ([value]: number[]) => {
    dispatch({ type: 'SET_MASTER_GAIN', gain: value });
  };

  const handlePadSelect = (padId: number) => {
    setSelectedPadId(padId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-roma-gold flex items-center gap-3">
          <Music className="h-8 w-8" />
          Sampler
        </h1>
        
        {/* Master Volume */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-roma-gold" />
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Master</Label>
                <Slider
                  value={[state.masterGain]}
                  onValueChange={handleMasterGainChange}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(state.masterGain * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pad Grid Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Play className="h-5 w-5" />
                Pad Grid
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click pads to play • Drag audio files to load • Selected: {selectedPadId !== null ? `Pad ${selectedPadId + 1}` : 'None'}
              </p>
            </CardHeader>
            <CardContent>
              <PadGrid onPadSelect={handlePadSelect} />
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="space-y-4">
          <PadDetail padId={selectedPadId} />
        </div>
      </div>
    </div>
  );
}

const Sampler = () => {
  return (
    <SamplerProvider>
      <SamplerContent />
    </SamplerProvider>
  );
};

export default Sampler;