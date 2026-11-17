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
    // Capgo live updates: download in the foreground, apply the next time the app goes to background.
    // Changing these options requires a store release (native config, not shipped by live updates).
    CapacitorUpdater: {
      autoUpdate: true,
      // No health/usage stats sent to Capgo (keeps data sharing to the bare update check; see /privacy).
      statsUrl: "",
    },
  },
};

export default config;
