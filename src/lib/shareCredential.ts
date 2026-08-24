interface ShareOptions {
  title?: string;
  text?: string;
  filename?: string;
}

export interface CredentialData {
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string;
  qrUrl: string;
  bgImageUrl: string;
}

const SCALE = 2;
const BASE_W = 362;
const BASE_H = 540;
const W = BASE_W * SCALE;
const H = BASE_H * SCALE;
const RADIUS = 16 * SCALE;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load: ${src}`));
      };
      img.src = objectUrl;
    } catch {
      reject(new Error(`Failed to fetch: ${src}`));
    }
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function renderCredentialCanvas(
  data: CredentialData,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const [bgResult, avatarResult, qrResult] = await Promise.allSettled([
    loadImage(data.bgImageUrl),
    loadImage(data.avatarUrl),
    loadImage(data.qrUrl),
  ]);

  roundedRectPath(ctx, 0, 0, W, H, RADIUS);
  ctx.clip();

  if (bgResult.status === "fulfilled") {
    ctx.drawImage(bgResult.value, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }

  const nameY = H * 0.09;
  const nameMaxWidth = W * 0.69;
  const nameFontSize = 16 * SCALE;

  ctx.font = `bold ${nameFontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";

  const nameText = `${data.firstName} ${data.lastName}`;
  const nameLines = wrapText(ctx, nameText, nameMaxWidth);
  const nameLineHeight = nameFontSize * 1.25;
  const nameTotalHeight = nameLines.length * nameLineHeight;
  const nameStartY = nameY - nameTotalHeight / 2 + nameLineHeight / 2;

  for (let i = 0; i < nameLines.length; i++) {
    ctx.fillText(nameLines[i], W / 2, nameStartY + i * nameLineHeight);
  }

  const avatarCenterY = H * 0.298;
  const avatarDiameter = W * 0.38;
  const avatarRadius = avatarDiameter / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (avatarResult.status === "fulfilled") {
    const img = avatarResult.value;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW: number, drawH: number;

    if (imgAspect > 1) {
      drawH = avatarDiameter;
      drawW = avatarDiameter * imgAspect;
    } else {
      drawW = avatarDiameter;
      drawH = avatarDiameter / imgAspect;
    }

    ctx.drawImage(
      img,
      W / 2 - drawW / 2,
      avatarCenterY - drawH / 2,
      drawW,
      drawH,
    );
  } else {
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(
      W / 2 - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarDiameter,
      avatarDiameter,
    );
    ctx.fillStyle = "#6b7280";
    ctx.font = `bold ${40 * SCALE}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const parts = (data.firstName?.trim() || "").split(" ").filter(Boolean);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts.length === 1
          ? parts[0][0].toUpperCase()
          : "?";
    ctx.fillText(initials, W / 2, avatarCenterY);
  }
  ctx.restore();

  const roleCenterY = H * 0.512;
  const roleFontSize = 20 * SCALE;

  ctx.font = `bold ${roleFontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const roleWidth = ctx.measureText(data.role).width;
  const gradientR = Math.max(roleWidth / 2, 40 * SCALE);
  const gradient = ctx.createRadialGradient(
    W / 2,
    roleCenterY,
    0,
    W / 2,
    roleCenterY,
    gradientR,
  );
  gradient.addColorStop(0.1, "#4285F4");
  gradient.addColorStop(0.41, "#EA4335");
  gradient.addColorStop(0.61, "#F9AB00");
  gradient.addColorStop(1.0, "#34A853");

  ctx.fillStyle = gradient;
  ctx.fillText(data.role, W / 2, roleCenterY);

  const qrCenterY = H * 0.71;
  const qrBoxSize = 128 * SCALE;
  const qrPadding = 8 * SCALE;
  const qrCornerR = 12 * SCALE;
  const qrX = W / 2 - qrBoxSize / 2;
  const qrY = qrCenterY - qrBoxSize / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
  ctx.shadowBlur = 6 * SCALE;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4 * SCALE;
  roundedRectPath(ctx, qrX, qrY, qrBoxSize, qrBoxSize, qrCornerR);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  if (qrResult.status === "fulfilled") {
    const qrImgSize = qrBoxSize - qrPadding * 2;
    ctx.drawImage(
      qrResult.value,
      qrX + qrPadding,
      qrY + qrPadding,
      qrImgSize,
      qrImgSize,
    );
  }

  return canvas;
}

export async function shareOrDownloadCredential(
  data: CredentialData,
  options: ShareOptions = {},
): Promise<{ success: boolean; action: "shared" | "downloaded" }> {
  const {
    title = "Mi Credencial GDG Sucre",
    text = "¡Ya me registré en GDG Sucre! Genera tu credencial aquí 🎉",
    filename = "credencial-gdgsucre.png",
  } = options;

  try {
    const canvas = await renderCredentialCanvas(data);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );

    if (!blob)
      throw new Error("No se pudo generar la imagen de la credencial.");

    const file = new File([blob], filename, { type: "image/png" });

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title,
        text,
        url: window.location.href,
        files: [file],
      });
      return { success: true, action: "shared" };
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, action: "downloaded" };
    }
  } catch (err) {
    console.error("Error al compartir credencial:", err);
    throw err;
  }
}
