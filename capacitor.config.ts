import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abdallah.taskflow',
  appName: 'TaskFlow AI',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      defaultChannel: 'production',
    },
  },
};

export default config;