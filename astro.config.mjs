import react from "@astrojs/react"
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig, fontProviders } from "astro/config"

// https://astro.build/config
export default defineConfig({
  output: "server",

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Google Sans Flex",
      cssVariable: "--font-google",
      weights: [400, 500, 600, 700],
    },
    {
      provider: fontProviders.google(),
      name: "Google Sans Code",
      cssVariable: "--font-monospace",
      weights: [300, 400, 700],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
  }),

  security: {
    checkOrigin: false,
  },
})
