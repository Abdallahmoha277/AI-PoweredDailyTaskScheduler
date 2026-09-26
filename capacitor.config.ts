import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abdallah.taskflow',
  appName: 'TaskFlow AI',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      defaultChannel: 'production',
      directUpdate: 'always',
      autoUpdate: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000',
    },
  },
};

export default config;git add .
git commit -m "feat: configure StatusBar as transparent"
git push