/** Client-side subject matting: border GMM-lite + flood fill + hole fill + feather. */

export interface RemoveOptions {
  threshold?: number;
  feather?: number;
}

export async function smartRemoveBackground(
  image: HTMLImageElement,
  options: RemoveOptions = {},
): Promise<HTMLCanvasElement> {
  const threshold = options.threshold ?? 0.34;
  const feather = options.feather ?? 1.4;

  const maxDim = 520;
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(2, Math.round(srcW * scale));
  const h = Math.max(2, Math.round(srcH * scale));

  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Canvas unsupported");
  sctx.drawImage(image, 0, 0, w, h);
  const img = sctx.getImageData(0, 0, w, h);

  const alpha = computeForeground(img, threshold);

  const small = document.createElement("canvas");
  small.width = w;
  small.height = h;
  const sm = small.getContext("2d");
  if (!sm) throw new Error("Canvas unsupported");
  const mid = sm.createImageData(w, h);
  for (let i = 0; i < alpha.length; i++) {
    mid.data[i * 4] = 255;
    mid.data[i * 4 + 1] = 255;
    mid.data[i * 4 + 2] = 255;
    mid.data[i * 4 + 3] = alpha[i];
  }
  sm.putImageData(mid, 0, 0);

  const out = document.createElement("canvas");
  out.width = srcW;
  out.height = srcH;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Canvas unsupported");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  const blur = Math.max(0.4, feather);
  octx.filter = `blur(${blur}px)`;
  octx.drawImage(small, 0, 0, srcW, srcH);
  octx.filter = "none";
  return out;
}

function computeForeground(img: ImageData, threshold: number): Uint8Array {
  const w = img.width;
  const h = img.height;
  const data = img.data;
  const n = w * h;

  const L = new Float32Array(n);
  const A = new Float32Array(n);
  const B = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    A[i] = r - g;
    B[i] = (r + g) * 0.5 - b;
  }

  const border = Math.max(2, Math.round(Math.min(w, h) * 0.045));
  const bgIdx: number[] = [];
  const fgIdx: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (y < border || y >= h - border || x < border || x >= w - border) {
        bgIdx.push(i);
      }
      const nx = (x + 0.5) / w - 0.5;
      const ny = (y + 0.5) / h - 0.5;
      if (nx * nx * 4.2 + ny * ny * 3.1 < 0.55) fgIdx.push(i);
    }
  }

  const bg = stats(L, A, B, bgIdx);
  const fg = stats(L, A, B, fgIdx.length ? fgIdx : [((h / 2) | 0) * w + ((w / 2) | 0)]);

  const distBg = new Float32Array(n);
  const distFg = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    distBg[i] = mahal(L[i], A[i], B[i], bg);
    distFg[i] = mahal(L[i], A[i], B[i], fg);
  }

  const chroma = Math.sqrt(bg.mA * bg.mA + bg.mB * bg.mB);
  const t = 0.12 + threshold * (chroma > 0.16 ? 0.7 : 0.55) + Math.sqrt(bg.vL) * 0.9;

  const isBg = new Uint8Array(n);
  const q = new Int32Array(n);
  let qs = 0;
  let qe = 0;

  const likelyBg = (i: number) => distBg[i] < t * 1.65 && distBg[i] < distFg[i] + t * 0.35;

  for (const i of bgIdx) {
    if (likelyBg(i) || distBg[i] < t * 1.15) {
      isBg[i] = 1;
      q[qe++] = i;
    }
  }

  while (qs < qe) {
    const i = q[qs++];
    const x = i % w;
    const y = (i / w) | 0;
    const tryN = (nx: number, ny: number) => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
      const j = ny * w + nx;
      if (isBg[j]) return;
      const dNb = Math.hypot(L[j] - L[i], A[j] - A[i], B[j] - B[i]);
      if (distBg[j] < t * 1.9 || (dNb < t * 0.85 && distBg[j] < t * 2.5 && distBg[j] <= distFg[j] + t)) {
        isBg[j] = 1;
        q[qe++] = j;
      }
    };
    tryN(x - 1, y);
    tryN(x + 1, y);
    tryN(x, y - 1);
    tryN(x, y + 1);
  }

  if (chroma > 0.2) {
    for (let i = 0; i < n; i++) {
      if (isBg[i]) continue;
      if (distBg[i] < t * 0.7 && distBg[i] + 0.08 < distFg[i]) isBg[i] = 1;
    }
  }

  fillInteriorHoles(isBg, w, h);
  dropTinyIslands(isBg, w, h, Math.max(12, (n * 0.0012) | 0));
  erodeBg(isBg, w, h, chroma > 0.18 ? 1 : 0);

  const alpha = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!isBg[i]) {
      alpha[i] = 255;
      continue;
    }
    const uncertain = distFg[i] < t * 1.1 && distBg[i] < t * 1.6;
    alpha[i] = uncertain ? 70 : 0;
  }

  return alpha;
}

interface ColorStats {
  mL: number;
  mA: number;
  mB: number;
  vL: number;
  vA: number;
  vB: number;
}

function stats(L: Float32Array, A: Float32Array, B: Float32Array, idx: number[]): ColorStats {
  let mL = 0;
  let mA = 0;
  let mB = 0;
  const k = Math.max(1, idx.length);
  for (const i of idx) {
    mL += L[i];
    mA += A[i];
    mB += B[i];
  }
  mL /= k;
  mA /= k;
  mB /= k;
  let vL = 0;
  let vA = 0;
  let vB = 0;
  for (const i of idx) {
    vL += (L[i] - mL) ** 2;
    vA += (A[i] - mA) ** 2;
    vB += (B[i] - mB) ** 2;
  }
  vL = Math.max(1e-4, vL / k);
  vA = Math.max(1e-4, vA / k);
  vB = Math.max(1e-4, vB / k);
  return { mL, mA, mB, vL, vA, vB };
}

function mahal(l: number, a: number, b: number, s: ColorStats) {
  const dL = (l - s.mL) / Math.sqrt(s.vL);
  const dA = (a - s.mA) / Math.sqrt(s.vA);
  const dB = (b - s.mB) / Math.sqrt(s.vB);
  return Math.sqrt(dL * dL + dA * dA * 1.35 + dB * dB * 1.35);
}

function fillInteriorHoles(isBg: Uint8Array, w: number, h: number) {
  const n = w * h;
  const seen = new Uint8Array(n);
  const q = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (!isBg[s] || seen[s]) continue;
    let qs = 0;
    let qe = 0;
    q[qe++] = s;
    seen[s] = 1;
    const comp: number[] = [];
    let touches = false;
    while (qs < qe) {
      const i = q[qs++];
      comp.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touches = true;
      const nbs = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const j of nbs) {
        if (j < 0 || seen[j] || !isBg[j]) continue;
        seen[j] = 1;
        q[qe++] = j;
      }
    }
    if (!touches) {
      for (const i of comp) isBg[i] = 0;
    }
  }
}

function dropTinyIslands(isBg: Uint8Array, w: number, h: number, minSize: number) {
  const n = w * h;
  const seen = new Uint8Array(n);
  const q = new Int32Array(n);
  const cx = w / 2;
  const cy = h / 2;
  for (let s = 0; s < n; s++) {
    if (isBg[s] || seen[s]) continue;
    let qs = 0;
    let qe = 0;
    q[qe++] = s;
    seen[s] = 1;
    const comp: number[] = [];
    let sx = 0;
    let sy = 0;
    while (qs < qe) {
      const i = q[qs++];
      comp.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      sx += x;
      sy += y;
      const nbs = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const j of nbs) {
        if (j < 0 || seen[j] || isBg[j]) continue;
        seen[j] = 1;
        q[qe++] = j;
      }
    }
    const mx = sx / comp.length - cx;
    const my = sy / comp.length - cy;
    const far = Math.hypot(mx / w, my / h) > 0.28;
    if (comp.length < minSize && far) {
      for (const i of comp) isBg[i] = 1;
    }
  }
}

function erodeBg(isBg: Uint8Array, w: number, h: number, iterations: number) {
  for (let k = 0; k < iterations; k++) {
    const next = isBg.slice();
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!isBg[i]) continue;
        if (!isBg[i - 1] || !isBg[i + 1] || !isBg[i - w] || !isBg[i + w]) next[i] = 0;
      }
    }
    isBg.set(next);
  }
}

export function invertMask(mask: HTMLCanvasElement) {
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const img = ctx.getImageData(0, 0, mask.width, mask.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i + 3] = 255 - d[i + 3];
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export function resetMask(mask: HTMLCanvasElement) {
  const ctx = mask.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, mask.width, mask.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, mask.width, mask.height);
}

export function featherMask(mask: HTMLCanvasElement, px: number) {
  const c = document.createElement("canvas");
  c.width = mask.width;
  c.height = mask.height;
  const ctx = c.getContext("2d");
  const mctx = mask.getContext("2d");
  if (!ctx || !mctx) return;
  ctx.filter = `blur(${Math.max(0, px)}px)`;
  ctx.drawImage(mask, 0, 0);
  mctx.clearRect(0, 0, mask.width, mask.height);
  mctx.drawImage(c, 0, 0);
}

export function magicWandErase(
  image: HTMLImageElement,
  mask: HTMLCanvasElement,
  lx: number,
  ly: number,
  tolerance: number,
  restore = false,
) {
  const w = image.naturalWidth || image.width;
  const h = image.naturalHeight || image.height;
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(lx)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(ly)));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.drawImage(image, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const i0 = (y0 * w + x0) * 4;
  const tr = data[i0];
  const tg = data[i0 + 1];
  const tb = data[i0 + 2];
  const tol = 8 + tolerance * 2.4;
  const tol2 = tol * tol;

  const seen = new Uint8Array(w * h);
  const q = new Int32Array(w * h);
  let qs = 0;
  let qe = 0;
  const start = y0 * w + x0;
  q[qe++] = start;
  seen[start] = 1;
  const hits: number[] = [];

  while (qs < qe) {
    const i = q[qs++];
    hits.push(i);
    const x = i % w;
    const y = (i / w) | 0;
    const tryN = (nx: number, ny: number) => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
      const j = ny * w + nx;
      if (seen[j]) return;
      const p = j * 4;
      const dr = data[p] - tr;
      const dg = data[p + 1] - tg;
      const db = data[p + 2] - tb;
      if (dr * dr + dg * dg + db * db <= tol2) {
        seen[j] = 1;
        q[qe++] = j;
      }
    };
    tryN(x - 1, y);
    tryN(x + 1, y);
    tryN(x, y - 1);
    tryN(x, y + 1);
  }

  const mctx = mask.getContext("2d", { willReadFrequently: true });
  if (!mctx) return;
  const md = mctx.getImageData(0, 0, mask.width, mask.height);
  const scaleX = mask.width / w;
  const scaleY = mask.height / h;
  if (mask.width === w && mask.height === h) {
    for (const i of hits) {
      const p = i * 4;
      if (restore) {
        md.data[p] = 255;
        md.data[p + 1] = 255;
        md.data[p + 2] = 255;
        md.data[p + 3] = 255;
      } else {
        md.data[p + 3] = 0;
      }
    }
    mctx.putImageData(md, 0, 0);
    return;
  }
  for (const i of hits) {
    const x = Math.round((i % w) * scaleX);
    const y = Math.round(((i / w) | 0) * scaleY);
    if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) continue;
    const p = (y * mask.width + x) * 4;
    if (restore) {
      md.data[p] = 255;
      md.data[p + 1] = 255;
      md.data[p + 2] = 255;
      md.data[p + 3] = 255;
    } else {
      md.data[p + 3] = 0;
    }
  }
  mctx.putImageData(md, 0, 0);
}

export function replaceMask(target: HTMLCanvasElement, source: HTMLCanvasElement) {
  const ctx = target.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(source, 0, 0, target.width, target.height);
}
