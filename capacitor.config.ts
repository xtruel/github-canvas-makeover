import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ad45f66019d641e884602ddc6c86b1cc',
  appName: 'github-canvas-makeover',
  webDir: 'dist',
  server: {
    url: 'https://ad45f660-19d6-41e8-8460-2ddc6c86b1cc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;