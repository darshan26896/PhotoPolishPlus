import type { DocBackground, Layer, Size } from "../types";
import { paintStyled } from "./adjust";

export function getSprite(layer: Layer, bypass = false): HTMLCanvasElement {
  if (!bypass && !layer.spriteDirty && layer.sprite) return layer.sprite;
  const c = bypass ? document.createElement("canvas") : (layer.sprite ?? document.createElement("canvas"));
  c.width = layer.width;
  c.height = layer.height;
  paintStyled(c, layer, bypass);
  if (!bypass) {
    layer.sprite = c;
    layer.spriteDirty = false;
  }
  return c;
}

export function composite(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  doc: Size,
  paper: DocBackground,
  bypass = false,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, doc.w, doc.h);

  if (paper.mode === "color") {
    ctx.fillStyle = paper.color;
    ctx.fillRect(0, 0, doc.w, doc.h);
  }

  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    const sprite = getSprite(layer, bypass);
    ctx.save();
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);
    ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity / 100));
    ctx.globalCompositeOperation = layer.blendMode;
    ctx.drawImage(sprite, -layer.width / 2, -layer.height / 2);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export function drawSelection(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  zoom: number,
) {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  const w = layer.width * layer.scale;
  const h = layer.height * layer.scale;
  const lw = Math.max(1, 1 / zoom);
  ctx.strokeStyle = "rgba(240, 217, 168, 0.95)";
  ctx.lineWidth = lw;
  ctx.setLineDash([6 / zoom, 4 / zoom]);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.setLineDash([]);

  const hs = Math.max(6 / zoom, 7 / zoom);
  const handles: [number, number][] = [
    [-w / 2, -h / 2],
    [0, -h / 2],
    [w / 2, -h / 2],
    [w / 2, 0],
    [w / 2, h / 2],
    [0, h / 2],
    [-w / 2, h / 2],
    [-w / 2, 0],
  ];
  ctx.fillStyle = "#1a1612";
  ctx.strokeStyle = "#f0d9a8";
  ctx.lineWidth = lw;
  for (const [hx, hy] of handles) {
    ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
  }

  const rx = 0;
  const ry = -h / 2 - 22 / zoom;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(rx, ry);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rx, ry, 6 / zoom, 0, Math.PI * 2);
  ctx.fillStyle = "#f0d9a8";
  ctx.fill();
  ctx.restore();
}

export type HandleId =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "rot"
  | "body";

export function hitHandle(
  layer: Layer,
  docPt: { x: number; y: number },
  zoom: number,
): HandleId | null {
  const local = {
    x: docPt.x - layer.x,
    y: docPt.y - layer.y,
  };
  const r = rotateVec(local.x, local.y, -layer.rotation);
  const w = layer.width * layer.scale;
  const h = layer.height * layer.scale;
  const thresh = 10 / zoom;
  const handles: { id: HandleId; x: number; y: number }[] = [
    { id: "nw", x: -w / 2, y: -h / 2 },
    { id: "n", x: 0, y: -h / 2 },
    { id: "ne", x: w / 2, y: -h / 2 },
    { id: "e", x: w / 2, y: 0 },
    { id: "se", x: w / 2, y: h / 2 },
    { id: "s", x: 0, y: h / 2 },
    { id: "sw", x: -w / 2, y: h / 2 },
    { id: "w", x: -w / 2, y: 0 },
    { id: "rot", x: 0, y: -h / 2 - 22 / zoom },
  ];
  for (const handle of handles) {
    if (Math.hypot(r.x - handle.x, r.y - handle.y) <= thresh) return handle.id;
  }
  if (Math.abs(r.x) <= w / 2 && Math.abs(r.y) <= h / 2) return "body";
  return null;
}

function rotateVec(x: number, y: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}
