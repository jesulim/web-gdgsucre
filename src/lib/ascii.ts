import asciiLogo from "@/data/landing/ascii-logo.json";

export interface AsciiRow {
  text: string;
  colors: (string | null)[];
}

export interface AsciiArtData {
  version: number;
  generator?: string;
  columns: number;
  rowCount: number;
  colorMode?: string;
  background?: string | null;
  rows: AsciiRow[];
}

export interface ParsedAsciiArt {
  format: string;
  styles: string[];
}

export function parseAsciiArt(
  data: AsciiArtData = asciiLogo as AsciiArtData,
  fontFamily: string = "monospace",
): ParsedAsciiArt {
  let format = "";
  const styles: string[] = [];

  data.rows.forEach((row, rowIndex) => {
    let currentChunk = "";
    let currentColor: string | null = null;

    for (let i = 0; i < row.text.length; i++) {
      const char = row.text[i];
      const color = row.colors[i] || null;

      if (i === 0) {
        currentColor = color;
        currentChunk = char;
      } else if (color === currentColor) {
        currentChunk += char;
      } else {
        format += `%c${currentChunk}`;
        styles.push(
          currentColor
            ? `color: ${currentColor}; font-family: ${fontFamily}; font-weight: bold;`
            : `color: transparent; font-family: ${fontFamily};`,
        );
        currentColor = color;
        currentChunk = char;
      }
    }

    if (currentChunk.length > 0) {
      format += `%c${currentChunk}`;
      styles.push(
        currentColor
          ? `color: ${currentColor}; font-family: ${fontFamily}; font-weight: bold;`
          : `color: transparent; font-family: ${fontFamily};`,
      );
    }

    if (rowIndex < data.rows.length - 1) {
      format += "\n";
    }
  });

  return { format, styles };
}

export function printConsoleBanner(
  message?: string,
  data: AsciiArtData = asciiLogo as AsciiArtData,
): void {
  if (typeof window === "undefined" || typeof console === "undefined") {
    return;
  }

  const { format, styles } = parseAsciiArt(data);
  console.log(format, ...styles);

  if (message) {
    console.log(message);
  } else {
    console.log(
      "%cGoogle %cDeveloper %cGroup %cSucre\n%cPssst, la consola sólo es el comienzo...\nPrueba presionando `",
      "font-size: 14px; font-weight: bold; color: #349cff; padding: 6px 0 2px 0;",
      "font-size: 14px; font-weight: bold; color: #ff3520; padding: 6px 0 2px 0;",
      "font-size: 14px; font-weight: bold; color: #ffed00; padding: 6px 0 2px 0;",
      "font-size: 14px; font-weight: bold; color: #00c256; padding: 6px 0 2px 0;",
      "font-size: 12px; color: #9aa0a6; line-height: 1.5;",
    );
  }
}
