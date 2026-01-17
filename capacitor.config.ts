import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.morador.app',
  appName: 'App Morador',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3500,
      launchAutoHide: false,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    }
  },
  /* 
  server: {
    url: 'http://192.168.100.99:7778',
    cleartext: true
  }
  */
};

export default config;
