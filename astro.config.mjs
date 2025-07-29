import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
// @ts-check
import { defineConfig } from "astro/config"

import vercel from "@astrojs/vercel"

// https://astro.build/config
export default defineConfig({
  output: "server",

  experimental: {
    fonts: [
      {
        provider: "local",
        name: "Google Sans Display",
        cssVariable: "--font-google",
        variants: [
          {
            weight: "400",
            style: "normal",
            src: ["./src/assets/fonts/GoogleSansDisplay-Regular.ttf"],
          },
          {
            weight: "700",
            style: "normal",
            src: ["./src/assets/fonts/GoogleSansDisplay-Bold.ttf"],
          },
        ],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
})
