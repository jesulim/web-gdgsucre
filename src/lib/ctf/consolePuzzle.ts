import { printConsoleBanner } from "@/lib/ascii";
import { toast } from "sonner";
import {
  CANONICAL_DINO_KEY,
  analyzeSubmission,
  generateDinoPackets,
  validateFlag,
} from "./obfuscation";
import type { ClaimResult, EasterEggBadge, GDGConsoleInterface } from "./types";

export const BADGE_STORAGE_KEY = "gdg_devtools_badge_unlocked";

export const EASTER_EGG_BADGE_INFO: Omit<
  EasterEggBadge,
  "unlockedAt" | "flag"
> = {
  id: "dino-hacker",
  name: "Dino Hacker",
  description: "Reparaste los datos del dino en las DevTools del GDG Sucre.",
  image_url: "/badges/dino-hacker.svg",
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
};

export function getStoredEasterEggBadge(): EasterEggBadge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EasterEggBadge;
  } catch {
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
    try {
      localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badge));
    } catch {}
    window.dispatchEvent(
      new CustomEvent("gdg:badge-unlocked", { detail: badge }),
    );
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
          `Hemos encontrado un lote de paquetes desordenados y con datos corruptos.\n\n` +
          `👉 Ejecuta %cconsole.table(gdg.packets)%c para explorar los paquetes.\n` +
          `👉 Descarta los paquetes corruptos (%ccorrupted === true%c), ordénalos por %cseq%c y une sus caracteres.\n` +
          `👉 Cuando tengas la clave, valídala con %cgdg.unlock("CLAVE")%c.\n` +
          `👉 Si necesitas ayuda con el código, escribe %cgdg.hint()%c.`,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
      );
    },

    hint: () => {
      console.log(
        "%c[PISTA // JAVASCRIPT ARRAY PIPELINE]%c",
        STYLES.yellowHeader,
        "color: #fbbc05; font-weight: bold; margin-left: 6px;",
      );
      console.log(
        `%cPuedes encadenar 4 métodos estándar de Array para resolverlo en un solo one-liner:\n\n` +
          `1. %c.filter(p => !p.corrupted)%c  -> Conserva solo los paquetes no corruptos\n` +
          `2. %c.sort((a, b) => a.seq - b.seq)%c -> Ordena los paquetes cronológicamente según 'seq'\n` +
          `3. %c.map(p => p.char)%c           -> Extrae el carácter de cada paquete\n` +
          `4. %c.join("")%c                   -> Une los caracteres en una sola cadena de texto\n\n` +
          `💡 Ejemplo:\n` +
          `%cconst key = gdg.packets.filter(p => !p.corrupted).sort((a, b) => a.seq - b.seq).map(p => p.char).join("")\n` +
          `gdg.unlock(key)%c`,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
        STYLES.subtle,
        STYLES.code,
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
        }
      } catch {}

      try {
        toast.success("🦖 ¡Insignia Desbloqueada: Dino Hacker!", {
          description: "Has reparado los datos del dino del GDG Sucre.",
          duration: 6000,
        });
      } catch {}

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
          `${synced ? "Sincronizado exitosamente con tu perfil de la comunidad." : "Guardado en este navegador (Inicia sesión para sincronizarlo con tu cuenta)."}\n` +
          `Visita tu perfil para ver tu nueva insignia.`,
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
        console.log(
          `%c🏆 Estado: DESBLOQUEADA\n` +
            `Insignia: ${badge.name}\n` +
            `Fecha de obtención: ${dateStr}\n` +
            `Clave registrada: ${badge.flag}\n\n` +
            `¡Puedes volver a ejecutar gdg.start() cuando quieras para practicar!`,
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

  // Attach to window.gdg
  window.gdg = gdgNamespace;
}
