import type { DinoPacket } from "./types";

export const CANONICAL_DINO_KEY = "GDG_DINO_HACKER";

const NOISE_CHARS = ["X", "#", "9", "Z", "!"];

export function generateDinoPackets(): DinoPacket[] {
  const validChars = CANONICAL_DINO_KEY.split("");
  const validPackets: DinoPacket[] = validChars.map((char, seq) => ({
    seq,
    char,
    corrupted: false,
  }));

  const noisePackets: DinoPacket[] = [
    { seq: 99, char: "X", corrupted: true },
    { seq: 42, char: "#", corrupted: true },
    { seq: 77, char: "9", corrupted: true },
    { seq: 13, char: "Z", corrupted: true },
    { seq: 88, char: "!", corrupted: true },
  ];

  return [
    validPackets[8], // '_'
    noisePackets[0], // 'X'
    validPackets[0], // 'G'
    validPackets[5], // 'I'
    noisePackets[1], // '#'
    validPackets[1], // 'D'
    validPackets[10], // 'A'
    validPackets[3], // '_'
    noisePackets[2], // '9'
    validPackets[14], // 'R'
    validPackets[2], // 'G'
    validPackets[4], // 'D'
    noisePackets[3], // 'Z'
    validPackets[7], // 'O'
    validPackets[9], // 'H'
    noisePackets[4], // '!'
    validPackets[6], // 'N'
    validPackets[11], // 'C'
    validPackets[13], // 'E'
    validPackets[12], // 'K'
  ];
}

export function validateFlag(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return input.trim().toUpperCase() === CANONICAL_DINO_KEY;
}

export function analyzeSubmission(input: string): string {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return "Debes pasar tu clave resuelta como argumento, ej: gdg.unlock('TU_CLAVE').";
  }

  const normalized = input.trim().toUpperCase();

  const containsNoise = NOISE_CHARS.some((char) => normalized.includes(char));
  if (containsNoise) {
    return "Parece que incluiste caracteres de paquetes corruptos (corrupted: true). Recuerda filtrarlos primero con: .filter(p => !p.corrupted)";
  }
  const sortedInputChars = normalized.split("").sort().join("");
  const sortedExpectedChars = CANONICAL_DINO_KEY.split("").sort().join("");

  if (
    sortedInputChars === sortedExpectedChars &&
    normalized !== CANONICAL_DINO_KEY
  ) {
    return "¡Casi lo tienes! Tienes los caracteres correctos, pero no están en orden. Recuerda ordenarlos con: .sort((a, b) => a.seq - b.seq)";
  }

  return "La clave ingresada no es válida. Revisa los paquetes con console.table(gdg.packets) o escribe gdg.hint() para más ayuda.";
}
