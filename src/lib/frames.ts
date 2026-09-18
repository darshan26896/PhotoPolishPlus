export interface FrameDef {
  id: string;
  name: string;
  swatch: string;
}

export const FRAMES: FrameDef[] = [
  { id: "none", name: "None", swatch: "transparent" },
  { id: "thin-white", name: "Thin White", swatch: "#f4efe6" },
  { id: "thin-black", name: "Thin Black", swatch: "#111" },
  { id: "gold", name: "Gold Line", swatch: "#d4b483" },
  { id: "double-gold", name: "Double Gold", swatch: "#e2c48a" },
  { id: "polaroid", name: "Polaroid", swatch: "#f6f1e8" },
  { id: "film", name: "35mm Film", swatch: "#1a1a1a" },
  { id: "mat", name: "Gallery Mat", swatch: "#e8e0d4" },
  { id: "thick-black", name: "Gallery Black", swatch: "#0c0c0e" },
  { id: "rounded", name: "Rounded", swatch: "#c4b8aa" },
  { id: "circle", name: "Circle", swatch: "#8aa0b4" },
  { id: "postage", name: "Postage", swatch: "#c07030" },
  { id: "neon", name: "Neon", swatch: "#5ef0ff" },
  { id: "sage", name: "Sage Mat", swatch: "#9dba86" },
  { id: "postcard", name: "Postcard", swatch: "#eadcc8" },
  { id: "ornate", name: "Ornate", swatch: "#c9a227" },
  { id: "instant", name: "Instant", swatch: "#222" },
  { id: "silver", name: "Silver", swatch: "#c5d0d8" },
];

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  color: string,
) {
  if (!id || id === "none") return;
  ctx.save();
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  const inset = Math.max(6, Math.min(w, h) * 0.018);
  const stroke = (c: string, width: number, off = 0) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = width;
    ctx.strokeRect(off + width / 2, off + width / 2, w - width - off * 2, h - width - off * 2);
  };

  if (id === "thin-white") stroke("#f4efe6", Math.max(4, inset * 0.7));
  else if (id === "thin-black") stroke("#111111", Math.max(4, inset * 0.7));
  else if (id === "gold") stroke(color || "#d4b483", Math.max(5, inset * 0.85));
  else if (id === "double-gold") {
    stroke(color || "#e2c48a", Math.max(3, inset * 0.45), inset * 0.4);
    stroke(color || "#e2c48a", Math.max(2, inset * 0.3), inset * 1.5);
  } else if (id === "polaroid") {
    const side = Math.max(10, w * 0.045);
    const top = side;
    const bot = Math.max(28, h * 0.14);
    ctx.fillStyle = color || "#f6f1e8";
    ctx.fillRect(0, 0, w, top);
    ctx.fillRect(0, 0, side, h);
    ctx.fillRect(w - side, 0, side, h);
    ctx.fillRect(0, h - bot, w, bot);
  } else if (id === "film") {
    ctx.fillStyle = "#0a0a0a";
    const band = Math.max(16, Math.min(w, h) * 0.07);
    ctx.fillRect(0, 0, w, band);
    ctx.fillRect(0, h - band, w, band);
    ctx.fillStyle = "#cfcfc8";
    const holeW = band * 0.55;
    const holeH = band * 0.38;
    const gap = holeW * 1.7;
    for (let x = band * 0.35; x < w - holeW; x += gap) {
      ctx.fillRect(x, band * 0.28, holeW, holeH);
      ctx.fillRect(x, h - band * 0.28 - holeH, holeW, holeH);
    }
  } else if (id === "mat") {
    ctx.fillStyle = color || "#e8e0d4";
    const m = Math.max(18, Math.min(w, h) * 0.08);
    ctx.fillRect(0, 0, w, m);
    ctx.fillRect(0, 0, m, h);
    ctx.fillRect(w - m, 0, m, h);
    ctx.fillRect(0, h - m, w, m);
    stroke("#111111", 2, m);
  } else if (id === "thick-black") {
    const m = Math.max(16, Math.min(w, h) * 0.055);
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, w, m);
    ctx.fillRect(0, 0, m, h);
    ctx.fillRect(w - m, 0, m, h);
    ctx.fillRect(0, h - m, w, m);
  } else if (id === "rounded") {
    ctx.globalCompositeOperation = "destination-in";
    const r = Math.min(w, h) * 0.08;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  } else if (id === "circle") {
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  } else if (id === "postage") {
    ctx.strokeStyle = color || "#c07030";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.setLineDash([]);
    const r = 7;
    ctx.fillStyle = "#080808";
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath();
      ctx.arc(x, 0, r, 0, Math.PI * 2);
      ctx.arc(x, h, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath();
      ctx.arc(0, y, r, 0, Math.PI * 2);
      ctx.arc(w, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === "neon") {
    ctx.shadowColor = color || "#5ef0ff";
    ctx.shadowBlur = 18;
    stroke(color || "#5ef0ff", 4, 10);
  } else if (id === "sage") {
    const m = Math.max(14, Math.min(w, h) * 0.06);
    ctx.fillStyle = color || "#9dba86";
    ctx.fillRect(0, 0, w, m);
    ctx.fillRect(0, 0, m, h);
    ctx.fillRect(w - m, 0, m, h);
    ctx.fillRect(0, h - m, w, m);
  } else if (id === "postcard") {
    stroke("#f4efe6", 10);
    stroke("#111", 1.5, 16);
  } else if (id === "ornate") {
    stroke(color || "#c9a227", 3, 12);
    stroke(color || "#c9a227", 1.2, 20);
    const s = Math.min(w, h) * 0.06;
    ctx.strokeStyle = color || "#c9a227";
    ctx.lineWidth = 2;
    corners(ctx, w, h, s);
  } else if (id === "instant") {
    ctx.fillStyle = "#161616";
    const side = Math.max(8, w * 0.03);
    const bot = Math.max(22, h * 0.12);
    ctx.fillRect(0, 0, w, side);
    ctx.fillRect(0, 0, side, h);
    ctx.fillRect(w - side, 0, side, h);
    ctx.fillRect(0, h - bot, w, bot);
  } else if (id === "silver") {
    stroke("#d5dee4", 7);
    stroke("#8a96a0", 1.5, 9);
  }
  ctx.restore();
}

function corners(ctx: CanvasRenderingContext2D, w: number, h: number, s: number) {
  const draw = (x: number, y: number, sx: number, sy: number) => {
    ctx.beginPath();
    ctx.moveTo(x + s * sx, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + s * sy);
    ctx.stroke();
  };
  draw(18, 18, 1, 1);
  draw(w - 18, 18, -1, 1);
  draw(18, h - 18, 1, -1);
  draw(w - 18, h - 18, -1, -1);
}
