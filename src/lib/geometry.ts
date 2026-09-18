import type { Layer, Point } from "../types";

export function rotate(x: number, y: number, deg: number): Point {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}

export function screenToDoc(sx: number, sy: number, pan: Point, zoom: number): Point {
  return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
}

export function docToScreen(dx: number, dy: number, pan: Point, zoom: number): Point {
  return { x: dx * zoom + pan.x, y: dy * zoom + pan.y };
}

export function docToLayerLocal(dx: number, dy: number, layer: Layer): Point {
  const p = rotate(dx - layer.x, dy - layer.y, -layer.rotation);
  return {
    x: p.x / layer.scale + layer.width / 2,
    y: p.y / layer.scale + layer.height / 2,
  };
}

export function layerLocalToDoc(lx: number, ly: number, layer: Layer): Point {
  const p = rotate(
    (lx - layer.width / 2) * layer.scale,
    (ly - layer.height / 2) * layer.scale,
    layer.rotation,
  );
  return { x: p.x + layer.x, y: p.y + layer.y };
}

export function layerCorners(layer: Layer): Point[] {
  const hw = (layer.width * layer.scale) / 2;
  const hh = (layer.height * layer.scale) / 2;
  return [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ].map((p) => {
    const r = rotate(p.x, p.y, layer.rotation);
    return { x: r.x + layer.x, y: r.y + layer.y };
  });
}

export function pointInLayer(dx: number, dy: number, layer: Layer): boolean {
  const local = docToLayerLocal(dx, dy, layer);
  return local.x >= 0 && local.y >= 0 && local.x < layer.width && local.y < layer.height;
}

export function maskAlphaAt(layer: Layer, lx: number, ly: number): number {
  const ctx = layer.mask.getContext("2d");
  if (!ctx) return 0;
  const x = Math.floor(lx);
  const y = Math.floor(ly);
  if (x < 0 || y < 0 || x >= layer.width || y >= layer.height) return 0;
  const pix = ctx.getImageData(x, y, 1, 1).data;
  return pix[3];
}

export function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
