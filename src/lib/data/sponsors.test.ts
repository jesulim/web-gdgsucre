import { describe, expect, it } from "bun:test"
import fs from "node:fs"
import path from "node:path"

import {
  ALL_SPONSOR_ASSET_MODULES,
  AUDIENCE_SEGMENTS,
  BRAND_DELIVERABLES,
  CONTRIBUTION_MODALITIES,
  FEATURED_SPONSORS,
  INSTITUTIONAL_CONTACT,
  SPONSOR_CATEGORY_META,
  SPONSORS,
} from "./sponsors"

const SPONSOR_TEMPLATE_FILES = [
  path.resolve(import.meta.dir, "../../pages/sponsors.astro"),
  path.resolve(import.meta.dir, "../../pages/landing.astro"),
  path.resolve(import.meta.dir, "../../components/landing/SponsorsSection.astro"),
  path.resolve(import.meta.dir, "../../components/sponsors/SponsorLogo.astro"),
  path.resolve(import.meta.dir, "../../components/sponsors/SponsorsMasonry.astro"),
  path.resolve(import.meta.dir, "../../components/sponsors/SponsorshipBenefits.astro"),
]

describe("Sponsors catalog & institutional data", () => {
  it("imports and wires every image asset in src/assets/sponsors", () => {
    const sponsorsDir = path.resolve(import.meta.dir, "../../assets/sponsors")
    const filesOnDisk = fs
      .readdirSync(sponsorsDir)
      .filter(file => !file.startsWith("."))
      .sort()

    expect(filesOnDisk.length).toBe(30)
    expect(ALL_SPONSOR_ASSET_MODULES).toHaveLength(filesOnDisk.length)

    const sourceText = fs.readFileSync(path.resolve(import.meta.dir, "./sponsors.ts"), "utf-8")
    for (const file of filesOnDisk) {
      expect(sourceText).toContain(`@/assets/sponsors/${file}`)
    }

    const usedInSponsors = new Set<unknown>()
    for (const sponsor of SPONSORS) {
      usedInSponsors.add(sponsor.logo)
      if (sponsor.darkLogo) usedInSponsors.add(sponsor.darkLogo)
      if (sponsor.emblem) usedInSponsors.add(sponsor.emblem)
    }

    for (const assetModule of ALL_SPONSOR_ASSET_MODULES) {
      expect(usedInSponsors.has(assetModule)).toBe(true)
    }
  })

  it("defines 26 unique sponsors with valid metadata and dark-mode variants", () => {
    expect(SPONSORS).toHaveLength(26)

    const ids = new Set<string>()
    const validCategories = new Set(Object.keys(SPONSOR_CATEGORY_META))

    for (const sponsor of SPONSORS) {
      expect(sponsor.id.trim().length).toBeGreaterThan(0)
      expect(ids.has(sponsor.id)).toBe(false)
      ids.add(sponsor.id)

      expect(sponsor.name.trim().length).toBeGreaterThan(0)
      expect(sponsor.note.trim().length).toBeGreaterThan(0)
      expect(validCategories.has(sponsor.category)).toBe(true)
      expect(["compact", "regular", "featured"]).toContain(sponsor.masonrySize)

      if (sponsor.logoTreatment === "theme-pair") {
        expect(sponsor.darkLogo).toBeDefined()
      }

      if (sponsor.url !== undefined) {
        expect(sponsor.url).toMatch(/^https?:\/\//)
      }
    }
  })

  it("provides curated featured sponsors for the general landing teaser", () => {
    expect(FEATURED_SPONSORS.length).toBe(8)
    for (const sponsor of FEATURED_SPONSORS) {
      expect(sponsor.featuredInLanding).toBe(true)
    }
  })

  it("has valid demographic percentages totaling 100%", () => {
    const total = AUDIENCE_SEGMENTS.reduce((sum, segment) => sum + segment.percentage, 0)
    expect(total).toBe(100)
    expect(CONTRIBUTION_MODALITIES).toHaveLength(3)
    expect(BRAND_DELIVERABLES).toHaveLength(8)
  })

  it("keeps contact channels strictly institutional across data and templates", () => {
    expect(INSTITUTIONAL_CONTACT.email).toBe("gdgsucre@gmail.com")
    expect(INSTITUTIONAL_CONTACT.emailHref).toContain("mailto:gdgsucre@gmail.com")
    expect(INSTITUTIONAL_CONTACT.websiteUrl).toBe("https://gdgsucre.com")
    expect(INSTITUTIONAL_CONTACT.calendarUrl).toBe("https://calendario.gdgsucre.com")
    expect(INSTITUTIONAL_CONTACT.socials.length).toBeGreaterThanOrEqual(4)

    const combined = [
      JSON.stringify(INSTITUTIONAL_CONTACT),
      ...SPONSOR_TEMPLATE_FILES.map(file => fs.readFileSync(file, "utf-8")),
    ]
      .join("\n")
      .toLowerCase()

    expect(combined).not.toContain("sebastian")
    expect(combined).not.toContain("68636646")
    expect(combined).not.toContain("wa.me")
    expect(combined).not.toContain("whatsapp")
  })

  it("renders disabled brochure actions and avoids duplicate alt announcements on masonry cards", () => {
    const sponsorsPage = fs.readFileSync(
      path.resolve(import.meta.dir, "../../pages/sponsors.astro"),
      "utf-8"
    )
    const masonry = fs.readFileSync(
      path.resolve(import.meta.dir, "../../components/sponsors/SponsorsMasonry.astro"),
      "utf-8"
    )

    expect(sponsorsPage).toContain("disabled")
    expect(sponsorsPage).toContain("Próximamente")
    expect(masonry).toContain("decorative={true}")
  })

  it("renders an accessible auto-rotating sponsor carousel for all sponsors and join CTA on the landing section", () => {
    const sponsorsSection = fs.readFileSync(
      path.resolve(import.meta.dir, "../../components/landing/SponsorsSection.astro"),
      "utf-8"
    )

    expect(sponsorsSection).toContain('aria-roledescription="carousel"')
    expect(sponsorsSection).toContain('aria-roledescription="slide"')
    expect(sponsorsSection).toContain("SPONSORS.map")
    expect(sponsorsSection).toContain("SPONSORS.slice(0, -3)")
    expect(sponsorsSection).toContain("data-sponsor-markers-track")
    expect(sponsorsSection).toContain("data-bullet-distance")
    expect(sponsorsSection).not.toContain("FEATURED_SPONSORS")
    expect(sponsorsSection).toContain("AUTO_INTERVAL_MS = 3000")
    expect(sponsorsSection).toContain("data-sponsor-carousel-prev")
    expect(sponsorsSection).toContain("data-sponsor-carousel-next")
    expect(sponsorsSection).not.toContain("data-sponsor-carousel-toggle")
    expect(sponsorsSection).toContain("Únete como Sponsor")
  })
})
