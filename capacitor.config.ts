import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.easyfarm.app",
  appName: "EasyFarm",
  webDir: "public",
  server: {
    url: "https://easy-farm-i851.vercel.app",
    cleartext: true
  }
};

export default config;
