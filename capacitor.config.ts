import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.oneapp.mpesa',
  appName: 'My oneAPP',
  // TanStack Start client build + prerender lands here when CAPACITOR_BUILD=true
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
  },
};

export default config;
