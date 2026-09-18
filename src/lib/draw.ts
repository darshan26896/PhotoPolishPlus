import type { Layer } from "../types";
import { ensureBitmap } from "./image";

export function strokeDraw(
  bitmap: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  size: number,
  color: string,
  opacity: number,
  hardness: number,
  erase: boolean,
  highlighter: boolean,
) {
  const ctx = bitmap.getContext("2d");
  if (!ctx) return;
  const d = Math.hypot(x1 - x0, y1 - y0);
  const step = Math.max(0.6, size * 0.16);
  const n = Math.max(1, Math.ceil(d / step));
  ctx.save();
  ctx.globalCompositeOperation = erase ? "destination-out" : highlighter ? "multiply" : "source-over";
  const r = Math.max(0.5, size / 2);
  const inner = r * Math.min(0.985, Math.max(0, hardness));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const g = ctx.createRadialGradient(x, y, inner, x, y, r);
    const a = highlighter ? opacity * 0.35 : opacity;
    g.addColorStop(0, rgba(color, a));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function rgba(color: string, a: number) {
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    }
    return `rgba(${r},${g},${b},${a})`;
  }
  return color;
}

export function cloneStamp(
  dest: Layer,
  src: Layer,
  destX: number,
  destY: number,
  srcX: number,
  srcY: number,
  size: number,
  hardness: number,
  opacity: number,
) {
  const dbit = ensureBitmap(dest);
  const sbit = ensureBitmap(src);
  const r = Math.max(2, size / 2);
  const dim = Math.ceil(r * 2);
  const tmp = document.createElement("canvas");
  tmp.width = dim;
  tmp.height = dim;
  const tctx = tmp.getContext("2d");
  const dctx = dbit.getContext("2d");
  if (!tctx || !dctx) return;
  tctx.drawImage(sbit, srcX - r, srcY - r, dim, dim, 0, 0, dim, dim);
  tctx.globalCompositeOperation = "destination-in";
  const g = tctx.createRadialGradient(r, r, r * Math.min(0.98, hardness), r, r, r);
  g.addColorStop(0, `rgba(255,255,255,${opacity})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  tctx.fillStyle = g;
  tctx.fillRect(0, 0, dim, dim);
  dctx.drawImage(tmp, destX - r, destY - r);
}

export function applyRectMask(
  mask: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  invert = false,
) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  ctx.save();
  if (!invert) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

export function applyEllipseMask(
  mask: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = Math.abs(x1 - x0) / 2;
  const ry = Math.abs(y1 - y0) / 2;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, mask.width, mask.height);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function applyHeartMask(mask: HTMLCanvasElement, x0: number, y0: number, x1: number, y1: number) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const s = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 2;
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, mask.width, mask.height);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.7);
  ctx.bezierCurveTo(cx - s * 1.2, cy + s * 0.1, cx - s * 1.1, cy - s * 0.7, cx, cy - s * 0.25);
  ctx.bezierCurveTo(cx + s * 1.1, cy - s * 0.7, cx + s * 1.2, cy + s * 0.1, cx, cy + s * 0.7);
  ctx.fill();
  ctx.restore();
}

export function applyGradientMask(
  mask: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#000000");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, mask.width, mask.height);
}

export function clipLayerToRect(layer: Layer, cellW: number, cellH: number) {
  const ctx = layer.mask.getContext("2d");
  if (!ctx) return;
  const mw = cellW / Math.max(0.001, layer.scale);
  const mh = cellH / Math.max(0.001, layer.scale);
  const x = (layer.width - mw) / 2;
  const y = (layer.height - mh) / 2;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, layer.width, layer.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, y, mw, mh);
  layer.spriteDirty = true;
}
