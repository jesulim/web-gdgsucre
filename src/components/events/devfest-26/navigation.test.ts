import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { resolve } from "node:path"
import { getViteConfig } from "astro/config"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { createServer, type ViteDevServer } from "vite"

function extractAnchors(html: string) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    ([, href, text]) => ({
      href,
      label: text.trim(),
    })
  )
}

describe("DevFest 26 Header & Footer Agenda navigation", () => {
  let viteServer: ViteDevServer
  let container: AstroContainer
  let HeaderComponent: Parameters<AstroContainer["renderToString"]>[0]
  let FooterComponent: Parameters<AstroContainer["renderToString"]>[0]

  beforeAll(async () => {
    const projectRoot = resolve(import.meta.dir, "../../../..")
    const configFn = getViteConfig(
      {
        cacheDir: "/tmp/gdg-nav-vite-cache",
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
    const headerMod = await viteServer.ssrLoadModule(resolve(import.meta.dir, "./Header.astro"))
    const footerMod = await viteServer.ssrLoadModule(resolve(import.meta.dir, "./Footer.astro"))
    HeaderComponent = headerMod.default
    FooterComponent = footerMod.default
    container = await AstroContainer.create()
  })

  afterAll(async () => {
    await viteServer?.close()
  })

  it("includes Agenda (#agenda) positioned between Speakers and Sponsors in header nav", async () => {
    const html = await container.renderToString(HeaderComponent, {
      props: { showNav: true },
    })

    const navMatch = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)
    expect(navMatch).not.toBeNull()

    const anchorMatches = extractAnchors(navMatch?.[1] ?? "")

    expect(anchorMatches).toEqual([
      { href: "#about", label: "DevFest 2026" },
      { href: "#paquetes", label: "Paquetes" },
      { href: "#speakers", label: "Speakers" },
      { href: "#agenda", label: "Agenda" },
      { href: "#sponsors", label: "Sponsors" },
      { href: "#organizers", label: "Organizers" },
      { href: "/eventos/", label: "Eventos Pasados" },
    ])
  })

  it("includes Agenda (/#agenda) alongside section links in footer Evento navigation", async () => {
    const html = await container.renderToString(FooterComponent)

    const eventoNavMatch = html.match(/<nav\b[^>]*>[\s\S]*?>\s*Evento\s*<\/span>([\s\S]*?)<\/nav>/)
    expect(eventoNavMatch).not.toBeNull()

    const anchorMatches = extractAnchors(eventoNavMatch?.[1] ?? "")

    expect(anchorMatches).toEqual([
      { href: "/#about", label: "¿Qué es?" },
      { href: "/api/auth/signin?next=/registro/devfest-26", label: "Registrarme" },
      { href: "/#paquetes", label: "Paquetes" },
      { href: "/#agenda", label: "Agenda" },
      { href: "/#sponsors", label: "Sponsors" },
    ])
  })
})
