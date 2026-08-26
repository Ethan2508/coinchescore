import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.coinchescore",
  appName: "CoincheScore",
  webDir: "out",
  ios: {
    contentInset: "always",
    backgroundColor: "#022c22",
  },
  android: {
    backgroundColor: "#022c22",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
