import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSampler } from '../state/SamplerContext';
import { Waveform } from './Waveform';
import { Upload, Play, Square } from 'lucide-react';
import { useRef } from 'react';

interface PadDetailProps {
  padId: number | null;
}

export function PadDetail({ padId }: PadDetailProps) {
  const { state, dispatch, playPad, stopPad, loadAudioFile } = useSampler();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (padId === null) {
    return (
      <Card className="shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="text-roma-gold">Pad Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Select a pad to view controls
          </div>
        </CardContent>
      </Card>
    );
  }

  const pad = state.pads.find(p => p.id === padId);
  if (!pad) return null;

  const isPlaying = state.isPlaying[padId];

  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadAudioFile(padId, file);
    }
  };

  const handleSliceChange = (start: number, end: number) => {
    dispatch({ type: 'SET_SLICE', padId, start, end });
  };

  const handleEffectChange = (effectType: string, path: string[], value: number | string) => {
    let effectValue = { ...pad.effects[effectType as keyof typeof pad.effects] };
    
    if (path.length === 1) {
      effectValue = value;
    } else {
      // Navigate nested path
      let current = effectValue as any;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    }

    dispatch({
      type: 'SET_EFFECT',
      padId,
      effectType: effectType as keyof typeof pad.effects,
      value: effectValue,
    });
  };

  return (
    <div className="space-y-4">
      {/* File Loading */}
      <Card className="shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="text-roma-gold flex items-center gap-2">
            Pad {padId + 1}
            {pad.isLoaded && (
              <span className="text-sm text-muted-foreground">
                ({pad.fileName})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load Sample
            </Button>
            {pad.buffer && (
              <>
                <Button
                  onClick={() => isPlaying ? stopPad(padId) : playPad(padId)}
                  variant={isPlaying ? "destructive" : "default"}
                >
                  {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileLoad}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Waveform */}
      {pad.buffer && (
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold">Waveform</CardTitle>
          </CardHeader>
          <CardContent>
            <Waveform pad={pad} onSliceChange={handleSliceChange} />
          </CardContent>
        </Card>
      )}

      {/* Effects */}
      <Card className="shadow-glow border-border/50">
        <CardHeader>
          <CardTitle className="text-roma-gold">Effects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gain */}
          <div className="space-y-2">
            <Label>Gain</Label>
            <Slider
              value={[pad.effects.gain]}
              onValueChange={([value]) => handleEffectChange('gain', [], value)}
              max={2}
              min={0}
              step={0.01}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{pad.effects.gain.toFixed(2)}</span>
          </div>

          {/* Drive */}
          <div className="space-y-2">
            <Label>Drive</Label>
            <Slider
              value={[pad.effects.drive]}
              onValueChange={([value]) => handleEffectChange('drive', [], value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{pad.effects.drive.toFixed(2)}</span>
          </div>

          {/* Filter */}
          <div className="space-y-4">
            <Label className="text-lg">Filter</Label>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={pad.effects.filter.type}
                onValueChange={(value) => handleEffectChange('filter', ['type'], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowpass">Low Pass</SelectItem>
                  <SelectItem value="highpass">High Pass</SelectItem>
                  <SelectItem value="bandpass">Band Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cutoff</Label>
              <Slider
                value={[pad.effects.filter.cutoff]}
                onValueChange={([value]) => handleEffectChange('filter', ['cutoff'], value)}
                max={22000}
                min={20}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{pad.effects.filter.cutoff.toFixed(0)} Hz</span>
            </div>
            <div className="space-y-2">
              <Label>Resonance</Label>
              <Slider
                value={[pad.effects.filter.resonance]}
                onValueChange={([value]) => handleEffectChange('filter', ['resonance'], value)}
                max={10}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{pad.effects.filter.resonance.toFixed(1)}</span>
            </div>
          </div>

          {/* EQ */}
          <div className="space-y-4">
            <Label className="text-lg">3-Band EQ</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Low</Label>
                <Slider
                  value={[pad.effects.eq.low]}
                  onValueChange={([value]) => handleEffectChange('eq', ['low'], value)}
                  max={12}
                  min={-12}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{pad.effects.eq.low.toFixed(1)} dB</span>
              </div>
              <div className="space-y-2">
                <Label>Mid</Label>
                <Slider
                  value={[pad.effects.eq.mid]}
                  onValueChange={([value]) => handleEffectChange('eq', ['mid'], value)}
                  max={12}
                  min={-12}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{pad.effects.eq.mid.toFixed(1)} dB</span>
              </div>
              <div className="space-y-2">
                <Label>High</Label>
                <Slider
                  value={[pad.effects.eq.high]}
                  onValueChange={([value]) => handleEffectChange('eq', ['high'], value)}
                  max={12}
                  min={-12}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{pad.effects.eq.high.toFixed(1)} dB</span>
              </div>
            </div>
          </div>

          {/* Delay */}
          <div className="space-y-4">
            <Label className="text-lg">Delay</Label>
            <div className="space-y-2">
              <Label>Time</Label>
              <Slider
                value={[pad.effects.delay.time]}
                onValueChange={([value]) => handleEffectChange('delay', ['time'], value)}
                max={1}
                min={0.01}
                step={0.01}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{pad.effects.delay.time.toFixed(2)} s</span>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Slider
                value={[pad.effects.delay.feedback]}
                onValueChange={([value]) => handleEffectChange('delay', ['feedback'], value)}
                max={0.95}
                min={0}
                step={0.01}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{pad.effects.delay.feedback.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <Label>Mix</Label>
              <Slider
                value={[pad.effects.delay.mix]}
                onValueChange={([value]) => handleEffectChange('delay', ['mix'], value)}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{pad.effects.delay.mix.toFixed(2)}</span>
            </div>
          </div>

          {/* Envelope */}
          <div className="space-y-4">
            <Label className="text-lg">Envelope</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Attack</Label>
                <Slider
                  value={[pad.effects.envelope.attack]}
                  onValueChange={([value]) => handleEffectChange('envelope', ['attack'], value)}
                  max={1}
                  min={0.001}
                  step={0.001}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{pad.effects.envelope.attack.toFixed(3)} s</span>
              </div>
              <div className="space-y-2">
                <Label>Release</Label>
                <Slider
                  value={[pad.effects.envelope.release]}
                  onValueChange={([value]) => handleEffectChange('envelope', ['release'], value)}
                  max={5}
                  min={0.01}
                  step={0.01}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{pad.effects.envelope.release.toFixed(2)} s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}