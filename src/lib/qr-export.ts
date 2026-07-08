import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 320, margin: 2 });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Renders a grid "sheet" PNG containing one QR code + label per item. */
export async function generateQrSheetDataUrl(
  items: { label: string; url: string }[]
): Promise<string> {
  const qrSize = 220;
  const cellWidth = 240;
  const cellHeight = qrSize + 40;
  const columns = Math.min(4, Math.max(1, items.length));
  const rows = Math.ceil(items.length / columns);

  const canvas = document.createElement("canvas");
  canvas.width = columns * cellWidth;
  canvas.height = rows * cellHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < items.length; i++) {
    const { label, url } = items[i];
    const dataUrl = await generateQrDataUrl(url);
    const img = await loadImage(dataUrl);
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * cellWidth + (cellWidth - qrSize) / 2;
    const y = row * cellHeight + 10;
    ctx.drawImage(img, x, y, qrSize, qrSize);
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, col * cellWidth + cellWidth / 2, row * cellHeight + qrSize + 30);
  }

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}
