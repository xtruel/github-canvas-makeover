import { useState } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Knob } from '../components/Knob';
import { EqualizerBars } from '../components/EqualizerBars';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import '../music.css';

const EqualizerPage = () => {
  const { isPlaying } = useAudioPlayer();
  
  // Equalizer state
  const [eqBands, setEqBands] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 10-band EQ
  const [preset, setPreset] = useState('custom');
  const [masterVolume, setMasterVolume] = useState(80);
  const [bassBoost, setBassBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [balance, setBalance] = useState(0);

  const frequencies = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz', '16kHz'];
  
  const presets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rock: [3, 2, -1, -2, 1, 2, 1, 2, 3, 3],
    pop: [-1, 1, 3, 3, 1, -1, -1, 1, 2, 3],
    classical: [2, 1, -1, -1, 0, 1, 2, 2, 2, 1],
    jazz: [2, 1, 0, 1, -1, -1, 0, 1, 2, 3],
    vocal: [-2, -1, 1, 3, 3, 2, 1, 0, -1, -2],
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom' && presets[value as keyof typeof presets]) {
      setEqBands([...presets[value as keyof typeof presets]]);
    }
  };

  const handleBandChange = (index: number, value: number[]) => {
    const newBands = [...eqBands];
    newBands[index] = value[0];
    setEqBands(newBands);
    setPreset('custom');
  };

  const handleReset = () => {
    setEqBands([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setBassBoost(0);
    setTrebleBoost(0);
    setBalance(0);
    setPreset('flat');
  };

  return (
    <div className="min-h-screen music-page-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-roma-red to-roma-gold flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Equalizer</h1>
                <p className="text-muted-foreground">Fine-tune your audio experience</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Equalizer */}
            <div className="lg:col-span-2">
              <Card className="music-album-card">
                <CardHeader>
                  <CardTitle className="text-roma-gold flex items-center justify-between">
                    10-Band Equalizer
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="music-control-button"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Preset Selection */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Preset
                    </label>
                    <Select value={preset} onValueChange={handlePresetChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="vocal">Vocal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* EQ Bands */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-5 lg:grid-cols-10 gap-4">
                      {frequencies.map((freq, index) => (
                        <div key={freq} className="flex flex-col items-center gap-2">
                          <div className="h-32 flex items-end">
                            <Slider
                              orientation="vertical"
                              value={[eqBands[index]]}
                              onValueChange={(value) => handleBandChange(index, value)}
                              max={12}
                              min={-12}
                              step={0.5}
                              className="h-32 music-progress-track"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground text-center">
                            {freq}
                          </span>
                          <span className="text-xs text-roma-gold">
                            {eqBands[index] > 0 ? '+' : ''}{eqBands[index]}dB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Equalizer */}
                  <div className="mt-8 p-6 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center justify-center">
                      <EqualizerBars 
                        isPlaying={isPlaying} 
                        barCount={20} 
                        size="lg"
                        className="w-full max-w-md"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              {/* Master Controls */}
              <Card className="music-album-card">
                <CardHeader>
                  <CardTitle className="text-roma-gold">Master Controls</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Knob
                    value={masterVolume / 100}
                    onChange={(value) => setMasterVolume(value * 100)}
                    label="Master Volume"
                    size="lg"
                  />
                </CardContent>
              </Card>

              {/* Audio Enhancement */}
              <Card className="music-album-card">
                <CardHeader>
                  <CardTitle className="text-roma-gold">Enhancement</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Knob
                      value={(bassBoost + 12) / 24}
                      onChange={(value) => setBassBoost(value * 24 - 12)}
                      label="Bass Boost"
                      min={-12}
                      max={12}
                    />
                    <Knob
                      value={(trebleBoost + 12) / 24}
                      onChange={(value) => setTrebleBoost(value * 24 - 12)}
                      label="Treble Boost"
                      min={-12}
                      max={12}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Balance: {balance > 0 ? `R${balance}` : balance < 0 ? `L${Math.abs(balance)}` : 'Center'}
                    </label>
                    <Slider
                      value={[balance]}
                      onValueChange={(value) => setBalance(value[0])}
                      max={10}
                      min={-10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="music-album-card">
                <CardHeader>
                  <CardTitle className="text-roma-gold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full music-control-button"
                    onClick={() => handlePresetChange('rock')}
                  >
                    Roma Match Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full music-control-button"
                    onClick={() => handlePresetChange('vocal')}
                  >
                    Chant Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full music-control-button"
                    onClick={() => handlePresetChange('classical')}
                  >
                    Stadium Mode
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EqualizerPage;