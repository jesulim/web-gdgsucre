export interface EasterEggBadge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  unlockedAt: number;
  flag: string;
}

export interface ClaimResult {
  success: boolean;
  message: string;
  badge?: EasterEggBadge;
}

export interface DinoPacket {
  seq: number;
  char: string;
  corrupted: boolean;
}

export interface GDGConsoleInterface {
  start: () => void;
  packets: DinoPacket[];
  hint: () => void;
  unlock: (key: string) => Promise<ClaimResult | undefined>;
  status: () => void;
}

declare global {
  interface Window {
    gdg?: GDGConsoleInterface;
  }

  interface WindowEventMap {
    "gdg:badge-unlocked": CustomEvent<EasterEggBadge>;
  }
}
