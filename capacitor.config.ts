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
  plugins: {
    // Live updates with the open-source Capgo plugin in "No Cloud" mode (free): the check and download
    // are driven by components/LiveUpdates.tsx from files hosted on GitHub. Nothing is sent to Capgo.
    // Changing these options requires a store release (native config, not shipped by live updates).
    CapacitorUpdater: {
      autoUpdate: false,
      statsUrl: "",
    },
  },
};

export default config;
