import react from "@astrojs/react"
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig, fontProviders } from "astro/config"

// https://astro.build/config
export default defineConfig({
  output: "server",

  experimental: {
    fonts: [
      {
        provider: fontProviders.local(),
        name: "Google Sans Display",
        cssVariable: "--font-google",
        options: {
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
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    // FIXME: Issue with Astro 5.15 https://github.com/withastro/astro/issues/14692#issuecomment-3487416407
    optimizeDeps: {
      include: ["picocolors"],
    },
  },

  integrations: [react()],
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  security: {
    checkOrigin: false,
  },
})
