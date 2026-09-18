import type { Layer } from "../types";
import { ensureBitmap } from "./image";

/** Content-aware erase: fill a painted mark from surrounding pixels. */
export function aiErase(layer: Layer, mark: HTMLCanvasElement) {
  const bmp = ensureBitmap(layer);
  const w = bmp.width;
  const h = bmp.height;
  const maxDim = 260;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const sw = Math.max(2, Math.round(w * scale));
  const sh = Math.max(2, Math.round(h * scale));

  const srcC = document.createElement("canvas");
  srcC.width = sw;
  srcC.height = sh;
  const sctx = srcC.getContext("2d", { willReadFrequently: true });
  const mC = document.createElement("canvas");
  mC.width = sw;
  mC.height = sh;
  const mctx = mC.getContext("2d", { willReadFrequently: true });
  if (!sctx || !mctx) return;
  sctx.drawImage(bmp, 0, 0, sw, sh);
  mctx.drawImage(mark, 0, 0, sw, sh);
  const img = sctx.getImageData(0, 0, sw, sh);
  const md = mctx.getImageData(0, 0, sw, sh).data;
  const n = sw * sh;
  const hole = new Uint8Array(n);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (md[i * 4 + 3] > 40 || md[i * 4] > 40) {
      hole[i] = 1;
      count++;
    }
  }
  if (count < 4) return;

  const known = new Uint8Array(n);
  const R = new Float32Array(n);
  const G = new Float32Array(n);
  const B = new Float32Array(n);
  const d = img.data;
  for (let i = 0; i < n; i++) {
    R[i] = d[i * 4];
    G[i] = d[i * 4 + 1];
    B[i] = d[i * 4 + 2];
    known[i] = hole[i] ? 0 : 1;
  }

  const rad = 2;
  for (let pass = 0; pass < 48; pass++) {
    let filled = 0;
    const next = known.slice();
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const i = y * sw + x;
        if (known[i] || !hole[i]) continue;
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let wt = 0;
        let kn = 0;
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= sw || ny >= sh) continue;
            const j = ny * sw + nx;
            if (!known[j]) continue;
            const wgt = 1 / (Math.hypot(dx, dy) + 0.35);
            sr += R[j] * wgt;
            sg += G[j] * wgt;
            sb += B[j] * wgt;
            wt += wgt;
            kn++;
          }
        }
        if (kn >= 2 && wt > 0) {
          R[i] = sr / wt;
          G[i] = sg / wt;
          B[i] = sb / wt;
          if (kn >= 3) {
            next[i] = 1;
            filled++;
          }
        }
      }
    }
    known.set(next);
    if (filled === 0) break;
  }

  for (let i = 0; i < n; i++) {
    if (!hole[i]) continue;
    d[i * 4] = Math.max(0, Math.min(255, R[i]));
    d[i * 4 + 1] = Math.max(0, Math.min(255, G[i]));
    d[i * 4 + 2] = Math.max(0, Math.min(255, B[i]));
    d[i * 4 + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  const bctx = bmp.getContext("2d");
  if (!octx || !bctx) return;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(srcC, 0, 0, w, h);

  const maskFull = document.createElement("canvas");
  maskFull.width = w;
  maskFull.height = h;
  const mf = maskFull.getContext("2d");
  if (!mf) return;
  mf.filter = "blur(2.2px)";
  mf.drawImage(mark, 0, 0, w, h);
  mf.filter = "none";

  octx.globalCompositeOperation = "destination-in";
  octx.drawImage(maskFull, 0, 0);
  octx.globalCompositeOperation = "source-over";
  bctx.drawImage(out, 0, 0);
  layer.spriteDirty = true;
}
