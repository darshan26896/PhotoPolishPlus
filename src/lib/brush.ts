export function stampBrush(
  mask: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
  hardness: number,
  opacity: number,
  erase: boolean,
) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  const r = Math.max(0.5, size / 2);
  ctx.save();
  ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
  if (hardness >= 0.97) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const inner = r * Math.min(0.985, Math.max(0, hardness));
    const g = ctx.createRadialGradient(x, y, inner, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${opacity})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function strokeBrush(
  mask: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  size: number,
  hardness: number,
  opacity: number,
  erase: boolean,
) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const step = Math.max(0.6, size * (0.12 + (1 - hardness) * 0.08));
  const n = Math.max(1, Math.ceil(d / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    stampBrush(mask, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, size, hardness, opacity, erase);
  }
}
