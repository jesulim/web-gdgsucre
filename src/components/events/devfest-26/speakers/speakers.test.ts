import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { resolve } from "node:path"
import reactRenderer from "@astrojs/react/server.js"
import { getViteConfig } from "astro/config"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { createServer, type ViteDevServer } from "vite"

describe("DevFest 26 Speakers.astro backdrop", () => {
  let viteServer: ViteDevServer
  let container: AstroContainer
  let SpeakersComponent: Parameters<AstroContainer["renderToString"]>[0]

  beforeAll(async () => {
    const projectRoot = resolve(import.meta.dir, "../../../..")
    const configFn = getViteConfig(
      {
        cacheDir: "/tmp/gdg-speakers-vite-cache",
        optimizeDeps: { noDiscovery: true },
      },
      { root: projectRoot, configFile: false }
    )
    const viteConfig = await configFn({ mode: "test", command: "serve" })
    viteServer = await createServer({
      ...viteConfig,
      server: { middlewareMode: true, hmr: false },
      appType: "custom",
    })
    const mod = await viteServer.ssrLoadModule(resolve(import.meta.dir, "./Speakers.astro"))
    SpeakersComponent = mod.default
    container = await AstroContainer.create()
    container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer })
    container.addClientRenderer({
      name: "@astrojs/react",
      entrypoint: "@astrojs/react/client.js",
    })
  })

  afterAll(async () => {
    await viteServer?.close()
  })

  it("masks the ambient orb layer against vertical edge clipping without masking decorative SVGs", async () => {
    const html = await container.renderToString(SpeakersComponent)

    const sectionTagMatch = html.match(/<section\b[^>]*>/)
    expect(sectionTagMatch?.[0]).toContain("relative")
    expect(sectionTagMatch?.[0]).toContain("isolate")
    expect(sectionTagMatch?.[0]).toContain("overflow-hidden")

    const backdropMatch = html.match(
      /<div\b[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*max-w-5xl/
    )
    expect(backdropMatch).not.toBeNull()

    const backdropOpenTag = backdropMatch?.[0].match(/<div\b[^>]*>/)?.[0] ?? ""
    expect(backdropOpenTag).toContain("pointer-events-none")
    expect(backdropOpenTag).toContain("overflow-hidden")

    const backdropInner = backdropMatch?.[1] ?? ""
    const orbLayerMatch = backdropInner.match(
      /<div\b[^>]*class="[^"]*\borb-edge-fade\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*hidden lg:block/
    )
    expect(orbLayerMatch).not.toBeNull()

    const orbLayerInner = orbLayerMatch?.[1] ?? ""
    expect(orbLayerInner).toContain("bg-yellow-")
    expect(orbLayerInner).toContain("bg-red-")
    expect(orbLayerInner).not.toContain("<svg")

    const svgs = [...backdropInner.matchAll(/<svg\b[^>]*>/g)]
    expect(svgs).toHaveLength(2)
  })
})
