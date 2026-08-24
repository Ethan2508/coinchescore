import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoincheScore",
    short_name: "CoincheScore",
    description: "Compteur de points coinche & belote, gratuit et sans pub.",
    start_url: "/",
    display: "standalone",
    background_color: "#022c22",
    theme_color: "#022c22",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
