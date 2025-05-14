import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mz.org.csaude.comvida.frontend',
  appName: 'comVida',
  webDir: 'src-capacitor/www',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  
};

export default config;
