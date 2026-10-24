import { printConsoleBanner } from "@/lib/ascii";
import {
  CANONICAL_DINO_KEY,
  analyzeSubmission,
  generateDinoPackets,
  validateFlag,
} from "./obfuscation";
import type { ClaimResult, EasterEggBadge, GDGConsoleInterface } from "./types";

export const BADGE_STORAGE_KEY = "gdg_devtools_badge_unlocked";

export function getStorageBadgeUrl(
  path: string = "badges/dino-hacker.svg",
): string {
  const supabaseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    "";
  if (!supabaseUrl) return "";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/assets/${cleanPath}`;
}

export function getProfileUrl(): string {
  return typeof window !== "undefined"
    ? `${window.location.origin}/perfil`
    : "/perfil";
}

export const DEFAULT_DINO_BADGE_IMAGE_URL = getStorageBadgeUrl(
  "badges/dino-hacker.svg",
);

export const EASTER_EGG_BADGE_INFO: Omit<
  EasterEggBadge,
  "unlockedAt" | "flag"
> = {
  id: "dino-hacker",
  name: "Dino Hacker",
  description: "Reparaste los datos del dino en las DevTools del GDG Sucre.",
  image_url: DEFAULT_DINO_BADGE_IMAGE_URL,
};

const STYLES = {
  header:
    "font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
  blueHeader:
    "color: #ffffff; background: #4285f4; font-weight: bold; padding: 3px 6px; border-radius: 3px;",
  greenHeader:
    "color: #ffffff; background: #34a853; font-weight: bold; padding: 3px 6px; border-radius: 3px;",
  yellowHeader:
    "color: #202124; background: #fbbc05; font-weight: bold; padding: 3px 6px; border-radius: 3px;",
  redHeader:
    "color: #ffffff; background: #ea4335; font-weight: bold; padding: 3px 6px; border-radius: 3px;",
  purpleHeader:
    "color: #ffffff; background: #a142f4; font-weight: bold; padding: 3px 6px; border-radius: 3px;",
  code: "color: #00ff88; background: #1a1a2e; font-family: monospace; font-size: 12px; padding: 2px 6px; border-radius: 3px;",
  subtle: "color: #9aa0a6; font-size: 12px; line-height: 1.6;",
  highlight: "color: #ffffff; font-weight: bold;",
  link: "color: #349cff; text-decoration: underline; font-weight: bold; font-family: monospace; font-size: 12px;",
};

export function getStoredEasterEggBadge(): EasterEggBadge | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EasterEggBadge;
  } catch (err) {
    console.debug("[GDG-PUZZLE] Error reading stored badge:", err);
    return null;
  }
}

export function saveEasterEggBadge(flag: string): EasterEggBadge {
  const badge: EasterEggBadge = {
    ...EASTER_EGG_BADGE_INFO,
    unlockedAt: Date.now(),
    flag,
  };
  if (typeof window !== "undefined") {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badge));
      } catch (err) {
        console.debug("[GDG-PUZZLE] Error saving badge to localStorage:", err);
      }
    }
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("gdg:badge-unlocked", { detail: badge }),
      );
    }
  }
  return badge;
}

export function initConsolePuzzle(): void {
  if (typeof window === "undefined" || typeof console === "undefined") {
    return;
  }

  // Prevent multiple bindings
  if (
    (window as unknown as { __GDG_PUZZLE_INITIALIZED__?: boolean })
      .__GDG_PUZZLE_INITIALIZED__
  ) {
    return;
  }
  (
    window as unknown as { __GDG_PUZZLE_INITIALIZED__?: boolean }
  ).__GDG_PUZZLE_INITIALIZED__ = true;

  printConsoleBanner();

  const dinoPackets = generateDinoPackets();

  const gdgNamespace: GDGConsoleInterface = {
    packets: dinoPackets,

    start: () => {
      const existingBadge = getStoredEasterEggBadge();
      console.log(
        "%c[GDG SUCRE]%c",
        STYLES.blueHeader,
        "color: #4285f4; font-weight: bold; margin-left: 6px;",
      );

      if (existingBadge) {
        console.log(
          "%cℹ Ya eres miembro oficial de los Dino Hackers.%c\nPuedes resolver el desafío nuevamente para practicar tus habilidades de JS.",
          "color: #34a853; font-weight: bold;",
          STYLES.subtle,
        );
      }

      console.log(
        `%c🦖 MISIÓN: La señal del dino del GDG Sucre fue fragmentada en memoria.\n` +
          `Hemos detectado un lote de paquetes desordenados con interferencia y datos corruptos.\n\n` +
          `👉 Ejecuta %cconsole.table(gdg.packets)%c para explorar los fragmentos.\n` +
          `👉 Descarta el ruido corrupto, ordena las piezas por su secuencia y ensambla la clave.\n` +
          `👉 Cuando tengas la clave, valídala con %cgdg.unlock("CLAVE")%c.\n` +
          `👉 Si necesitas una pista, escribe %cgdg.hint()%c.`,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
      );
    },

    hint: () => {
      console.log(
        "%c[PISTA // TRANSMISIÓN FÓSIL]%c",
        STYLES.yellowHeader,
        "color: #fbbc05; font-weight: bold; margin-left: 6px;",
      );
      console.log(
        `%cEl mensaje está ahí, pero no te lo daremos tan fácil:\n\n` +
          `%cDescarta el ruido%c: Hay paquetes que no pertenecen a la señal original.\n` +
          `%cRastrea la secuencia%c: Cada fragmento legítimo contiene una pista sobre su posición cronológica.\n` +
          `%cReconstrucción%c: Conecta las letras en el orden exacto para revelar el código.\n\n` +
          `💡 %cTip dev%c: Los métodos de %cArray%c en JavaScript se pueden encadenar en una sola línea.\n` +
          `Explora los datos con %cconsole.table(gdg.packets)%c y pon a prueba tu lógica.`,
        STYLES.subtle,
        STYLES.highlight,
        STYLES.subtle,
        STYLES.highlight,
        STYLES.subtle,
        STYLES.highlight,
        STYLES.subtle,
        STYLES.highlight,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
      );
    },

    unlock: async (key: string): Promise<ClaimResult | undefined> => {
      const sanitizedKey =
        typeof key === "string" ? key.trim().toUpperCase() : "";

      if (!sanitizedKey || !validateFlag(sanitizedKey)) {
        const diagnostic = analyzeSubmission(key);
        console.log(
          "%c[ERROR EN LA TRANSMISIÓN]%c " + diagnostic,
          STYLES.redHeader,
          "color: #ea4335; margin-left: 6px; font-weight: 500;",
        );
        return { success: false, message: diagnostic };
      }

      const badge = saveEasterEggBadge(sanitizedKey);

      let synced = false;
      try {
        const response = await fetch("/api/badges/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flag: sanitizedKey }),
        });
        if (response.ok) {
          synced = true;
          try {
            const data = await response.json();
            if (data?.badge?.image_url) {
              badge.image_url = data.badge.image_url;
              saveEasterEggBadge(sanitizedKey);
            }
          } catch {}
        }
      } catch (err) {
        console.debug("[GDG-PUZZLE] Backend badge sync request failed:", err);
      }

      const profileUrl = getProfileUrl();

      console.log(
        `%c
               __
              / _)   🦖 ¡ROAAAR! DATOS RESTAURADOS
     _.----._/ /     ¡DESAFÍO COMPLETADO CON ÉXITO!
    /         /      Insignia: Dino Hacker
 __/ (  | (  |       Clave: ${sanitizedKey}
/__.-'|_|--|_|       
`,
        "color: #00ff88; font-family: monospace; font-weight: bold; font-size: 13px;",
      );

      console.log(
        `%c¡Felicitaciones! Has completado el DevTools Challenge del GDG Sucre.\n` +
          `${synced ? "Sincronizado exitosamente con tu perfil de la comunidad." : "Guardado en este navegador (Inicia sesión para sincronizarlo con tu cuenta)."}\n\n` +
          `👉 Mira tu nueva insignia en tu perfil:\n%c${profileUrl}%c`,
        STYLES.subtle,
        STYLES.link,
        STYLES.subtle,
      );

      return {
        success: true,
        message: "Insignia desbloqueada con éxito",
        badge,
      };
    },

    status: () => {
      const badge = getStoredEasterEggBadge();
      console.log(
        "%c[ESTADO DE LA INSIGNIA]%c",
        STYLES.purpleHeader,
        "color: #a142f4; font-weight: bold; margin-left: 6px;",
      );
      if (badge) {
        const dateStr = new Date(badge.unlockedAt).toLocaleString();
        const profileUrl = getProfileUrl();
        console.log(
          `%c🏆 Estado: DESBLOQUEADA\n` +
            `Insignia: ${badge.name}\n` +
            `Fecha de obtención: ${dateStr}\n` +
            `Clave registrada: ${badge.flag}\n\n` +
            `👉 Ver insignia en tu perfil:\n%c${profileUrl}%c\n\n` +
            `¡Puedes volver a ejecutar gdg.start() cuando quieras para practicar!`,
          "color: #34a853; font-weight: 500; font-family: monospace;",
          STYLES.link,
          "color: #34a853; font-weight: 500; font-family: monospace;",
        );
      } else {
        console.log(
          `%cℹ Estado: NO DESBLOQUEADA\n` +
            `Aún no has reclamado la insignia Dino Hacker.\n` +
            `Escribe %cgdg.start()%c para iniciar el desafío.`,
          STYLES.subtle,
          STYLES.code,
          STYLES.subtle,
        );
      }
    },
  };

  window.gdg = gdgNamespace;
}
