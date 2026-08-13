import { toPng } from "html-to-image";

interface ShareOptions {
  title?: string;
  text?: string;
  filename?: string;
  eventSlug?: string;
}

export async function shareOrDownloadCredential(
  element: HTMLElement,
  options: ShareOptions = {},
): Promise<{ success: boolean; action: "shared" | "downloaded" }> {
  const {
    title = "Mi Credencial GDG Sucre",
    text = "¡Ya me registré en GDG Sucre! Genera tu credencial aquí 🎉",
    filename = "credencial-gdgsucre.png",
  } = options;

  const prevTransform = element.style.transform;
  const prevTransition = element.style.transition;
  element.style.transform = "none";
  element.style.transition = "none";

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();

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
  } finally {
    element.style.transform = prevTransform;
    element.style.transition = prevTransition;
  }
}
