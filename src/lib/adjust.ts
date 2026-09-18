import type { Adjustments, DuoId, Layer, LayerLook } from "../types";
import { drawFrame } from "./frames";

export type { Adjustments, DuoId, LayerLook };

export interface LookDef {
  id: string;
  name: string;
  swatch: string;
  adj: Partial<Adjustments>;
  shadow?: string;
  high?: string;
  mid?: string;
}

export function defaultAdjust(): Adjustments {
  return {
    exposure: 0,
    brightness: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    temperature: 0,
    tint: 0,
    saturation: 0,
    vibrance: 0,
    hue: 0,
    clarity: 0,
    dehaze: 0,
    sharpness: 0,
    blur: 0,
    vignette: 0,
    grain: 0,
    fade: 0,
    sepia: 0,
    bloom: 0,
    pixelate: 0,
    bw: 0,
    duotone: 0,
    duoMap: "none",
  };
}

export function defaultLook(): LayerLook {
  return { id: "none", amount: 100 };
}

export const DUOTONES: { id: DuoId; name: string; shadow: string; high: string }[] = [
  { id: "none", name: "Off", shadow: "#000", high: "#fff" },
  { id: "sunset", name: "Sunset", shadow: "#2a1028", high: "#ffb070" },
  { id: "moon", name: "Moon", shadow: "#0b1020", high: "#d4e0ff" },
  { id: "forest", name: "Forest", shadow: "#07140c", high: "#c6e48b" },
  { id: "ember", name: "Ember", shadow: "#1a0804", high: "#ff6a3d" },
  { id: "ice", name: "Ice", shadow: "#041018", high: "#8ee8ff" },
  { id: "rose", name: "Rose", shadow: "#1a0810", high: "#ffb3c9" },
];

export const LOOKS: LookDef[] = [
  { id: "none", name: "Original", swatch: "linear-gradient(135deg,#2a2a2c,#6a6762)", adj: {} },
  {
    id: "noir",
    name: "Noir",
    swatch: "linear-gradient(135deg,#0a0a0a,#6d6d6d)",
    adj: { bw: 100, contrast: 32, vignette: 48, grain: 16, fade: 4, sharpness: 12 },
  },
  {
    id: "orion",
    name: "Orion",
    swatch: "linear-gradient(135deg,#12343d,#e07a3d)",
    adj: { contrast: 18, saturation: 12, temperature: -12, vignette: 22, fade: 8 },
    shadow: "rgba(20,90,110,0.38)",
    high: "rgba(230,130,60,0.28)",
  },
  {
    id: "portra",
    name: "Portra",
    swatch: "linear-gradient(135deg,#5c4033,#f0d2b6)",
    adj: { temperature: 18, tint: -6, fade: 14, contrast: -6, saturation: 8, shadows: 10 },
    high: "rgba(255,210,170,0.22)",
  },
  {
    id: "gold",
    name: "Kodak",
    swatch: "linear-gradient(135deg,#7a4b12,#f0c14b)",
    adj: { temperature: 28, contrast: 14, saturation: 16, highlights: -8, grain: 10 },
    high: "rgba(255,190,70,0.26)",
  },
  {
    id: "fuji",
    name: "Fuji",
    swatch: "linear-gradient(135deg,#1f4a38,#d7e7c5)",
    adj: { tint: 10, saturation: 14, contrast: 10, temperature: -6, clarity: 8 },
    shadow: "rgba(30,90,70,0.28)",
  },
  {
    id: "matte",
    name: "Matte",
    swatch: "linear-gradient(135deg,#3d3a36,#c4b8aa)",
    adj: { fade: 34, contrast: -18, highlights: -12, saturation: -8, grain: 8 },
  },
  {
    id: "bleach",
    name: "Bleach",
    swatch: "linear-gradient(135deg,#2b2b2b,#f2f0ea)",
    adj: { contrast: 36, saturation: -28, highlights: 16, clarity: 18, vignette: 16 },
  },
  {
    id: "chrome",
    name: "Chrome",
    swatch: "linear-gradient(135deg,#1c3344,#c5d8e6)",
    adj: { contrast: 22, saturation: 22, temperature: -16, sharpness: 20, clarity: 14 },
    high: "rgba(180,220,255,0.2)",
  },
  {
    id: "polaroid",
    name: "Polaroid",
    swatch: "linear-gradient(135deg,#8a6a4a,#efe4c8)",
    adj: { temperature: 22, fade: 22, contrast: -8, vignette: 18, grain: 14, saturation: -6 },
    high: "rgba(255,230,180,0.2)",
  },
  {
    id: "night",
    name: "Night",
    swatch: "linear-gradient(135deg,#0b1220,#3d5a80)",
    adj: { temperature: -28, contrast: 16, shadows: -16, vignette: 40, saturation: -10, bloom: 8 },
    shadow: "rgba(10,30,70,0.45)",
  },
  {
    id: "golden",
    name: "Hour",
    swatch: "linear-gradient(135deg,#9a4a12,#ffd28a)",
    adj: { temperature: 34, exposure: 6, bloom: 22, saturation: 10, highlights: 8, fade: 6 },
    high: "rgba(255,180,80,0.32)",
  },
  {
    id: "crimson",
    name: "Crimson",
    swatch: "linear-gradient(135deg,#4a1020,#e07070)",
    adj: { saturation: 10, contrast: 12, tint: -8, vignette: 20 },
    shadow: "rgba(90,10,30,0.4)",
    high: "rgba(255,120,110,0.22)",
  },
  {
    id: "sage",
    name: "Sage",
    swatch: "linear-gradient(135deg,#2a3d30,#c5d5c0)",
    adj: { tint: 14, saturation: -12, fade: 12, temperature: -8, contrast: -4 },
    mid: "rgba(120,160,130,0.28)",
  },
  {
    id: "infra",
    name: "Infrared",
    swatch: "linear-gradient(135deg,#3a1028,#f0c0d8)",
    adj: { hue: 28, saturation: 18, contrast: 16, highlights: 12, temperature: 8 },
    high: "rgba(255,160,200,0.3)",
    shadow: "rgba(40,0,40,0.3)",
  },
  {
    id: "cross",
    name: "Cross",
    swatch: "linear-gradient(135deg,#0e4a4a,#e8c85a)",
    adj: { contrast: 20, saturation: 8, fade: 10, hue: -8 },
    shadow: "rgba(0,90,100,0.4)",
    high: "rgba(240,200,70,0.28)",
  },
  {
    id: "cream",
    name: "Cream",
    swatch: "linear-gradient(135deg,#2c2824,#efe6d4)",
    adj: { bw: 100, temperature: 16, fade: 18, contrast: 8, vignette: 12, grain: 8 },
    high: "rgba(255,230,190,0.2)",
  },
  {
    id: "punch",
    name: "Punch",
    swatch: "linear-gradient(135deg,#5a1a2a,#f0a050)",
    adj: { contrast: 28, saturation: 32, clarity: 22, vibrance: 18, sharpness: 10 },
  },
  {
    id: "haze",
    name: "Haze",
    swatch: "linear-gradient(135deg,#6a7a88,#d8e0e6)",
    adj: { fade: 28, contrast: -22, dehaze: -24, temperature: -10, bloom: 12, saturation: -8 },
  },
  {
    id: "velvet",
    name: "Velvet",
    swatch: "linear-gradient(135deg,#3a2030,#d4a0b0)",
    adj: { clarity: -20, bloom: 18, fade: 16, temperature: 12, saturation: -4, blur: 0.4 },
    mid: "rgba(160,80,110,0.22)",
  },
  {
    id: "steel",
    name: "Steel",
    swatch: "linear-gradient(135deg,#1a2430,#8aa0b4)",
    adj: { temperature: -24, contrast: 20, saturation: -16, clarity: 12, vignette: 18 },
    shadow: "rgba(20,40,70,0.35)",
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "linear-gradient(135deg,#5a2808,#ffb060)",
    adj: { temperature: 42, saturation: 8, fade: 10, highlights: -6, grain: 8 },
    high: "rgba(255,150,40,0.3)",
  },
  {
    id: "paper",
    name: "Paper",
    swatch: "linear-gradient(135deg,#c8c2b6,#f6f1e8)",
    adj: { exposure: 18, fade: 20, saturation: -22, contrast: -10, highlights: 12, grain: 6 },
  },
  {
    id: "drama",
    name: "Drama",
    swatch: "linear-gradient(135deg,#140c08,#c07030)",
    adj: { contrast: 34, dehaze: 22, vignette: 52, shadows: -18, saturation: 8, clarity: 16 },
  },
  {
    id: "arctic",
    name: "Arctic",
    swatch: "linear-gradient(135deg,#1a3344,#d0f0ff)",
    adj: { temperature: -32, tint: 6, highlights: 14, saturation: -8, bloom: 10 },
    high: "rgba(180,230,255,0.28)",
  },
  {
    id: "film",
    name: "Still",
    swatch: "linear-gradient(135deg,#2a241c,#b8a078)",
    adj: { grain: 28, fade: 16, contrast: 8, temperature: 10, vignette: 24, saturation: -6 },
  },
];

export function resolveAdjust(layer: Layer): Adjustments {
  const base: Adjustments = { ...defaultAdjust(), ...layer.adjust };
  const look = LOOKS.find((l) => l.id === layer.look.id);
  const t = (layer.look.amount ?? 100) / 100;
  if (!look || look.id === "none" || t <= 0) return base;
  const out: Adjustments = { ...base };
  (Object.keys(look.adj) as (keyof Adjustments)[]).forEach((k) => {
    const v = look.adj[k];
    if (typeof v === "number" && typeof out[k] === "number") {
      (out[k] as number) = (out[k] as number) + v * t;
    }
  });
  return out;
}

export function isDefaultAdjust(a: Adjustments, look: LayerLook) {
  if (look.id !== "none" && look.amount > 0) return false;
  const d = defaultAdjust();
  return (Object.keys(d) as (keyof Adjustments)[]).every((k) => a[k] === d[k]);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function cssFilter(adj: Adjustments): string {
  const br = clamp(1 + adj.exposure * 0.012 + adj.brightness * 0.008 + adj.whites * 0.003, 0.22, 2.5);
  const ct = clamp(1 + adj.contrast * 0.012 + adj.dehaze * 0.008 - adj.fade * 0.0045, 0.22, 2.5);
  const sat = clamp(1 + adj.saturation * 0.015 + adj.vibrance * 0.01, 0, 3);
  const blur = Math.max(0, adj.blur);
  const sepia = clamp(adj.sepia / 100, 0, 1);
  const gray = clamp(adj.bw / 100, 0, 1);
  return `brightness(${br}) contrast(${ct}) saturate(${sat}) hue-rotate(${adj.hue}deg) blur(${blur}px) sepia(${sepia}) grayscale(${gray})`;
}

let noiseCanvas: HTMLCanvasElement | null = null;
function getNoise() {
  if (noiseCanvas) return noiseCanvas;
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const img = ctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 75;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  noiseCanvas = c;
  return c;
}

let snap: HTMLCanvasElement | null = null;
let mini: HTMLCanvasElement | null = null;

function sized(c: HTMLCanvasElement | null, w: number, h: number) {
  const canvas = c ?? document.createElement("canvas");
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return canvas;
}

export function paintStyled(target: HTMLCanvasElement, layer: Layer, bypass = false) {
  const w = layer.width;
  const h = layer.height;
  const ctx = target.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.clearRect(0, 0, w, h);

  const drawBase = (into: CanvasRenderingContext2D, filter: string) => {
    into.save();
    into.filter = filter;
    if (layer.flipX || layer.flipY) {
      into.translate(w / 2, h / 2);
      into.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
      into.translate(-w / 2, -h / 2);
    }
    into.drawImage(layer.bitmap ?? layer.image, 0, 0, w, h);
    into.restore();
    into.filter = "none";
  };

  if (bypass) {
    drawBase(ctx, "none");
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(layer.mask, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  const adj = resolveAdjust(layer);

  if (adj.pixelate > 2) {
    const f = Math.max(2, adj.pixelate);
    const sw = Math.max(1, Math.round(w / f));
    const sh = Math.max(1, Math.round(h / f));
    mini = sized(mini, sw, sh);
    const mctx = mini.getContext("2d");
    if (mctx) {
      mctx.imageSmoothingEnabled = true;
      mctx.clearRect(0, 0, sw, sh);
      mctx.save();
      mctx.filter = cssFilter({ ...adj, blur: 0 });
      mctx.drawImage(layer.bitmap ?? layer.image, 0, 0, sw, sh);
      mctx.restore();
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      if (layer.flipX || layer.flipY) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
        ctx.translate(-w / 2, -h / 2);
      }
      ctx.drawImage(mini, 0, 0, w, h);
      ctx.restore();
      ctx.imageSmoothingEnabled = true;
    }
  } else {
    drawBase(ctx, cssFilter(adj));
  }

  snap = sized(snap, w, h);
  const sctx = snap.getContext("2d");
  if (sctx) {
    sctx.globalCompositeOperation = "source-over";
    sctx.filter = "none";
    sctx.clearRect(0, 0, w, h);
    sctx.drawImage(target, 0, 0);
  }

  const overlay = (
    op: GlobalCompositeOperation,
    alpha: number,
    filter: string | null,
    paint: () => void,
  ) => {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.globalCompositeOperation = op;
    ctx.filter = filter ?? "none";
    paint();
    ctx.restore();
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  if (adj.shadows !== 0) {
    overlay(
      adj.shadows > 0 ? "screen" : "multiply",
      Math.abs(adj.shadows) / 140,
      adj.shadows > 0 ? "brightness(1.2) contrast(0.85)" : "brightness(0.65)",
      () => ctx.drawImage(snap!, 0, 0),
    );
  }
  if (adj.highlights !== 0) {
    overlay(
      adj.highlights > 0 ? "screen" : "multiply",
      Math.abs(adj.highlights) / 150,
      adj.highlights > 0 ? "brightness(1.35) contrast(0.8)" : "brightness(0.75) contrast(1.1)",
      () => ctx.drawImage(snap!, 0, 0),
    );
  }
  if (adj.blacks !== 0) {
    overlay(
      adj.blacks > 0 ? "screen" : "multiply",
      Math.abs(adj.blacks) / 160,
      adj.blacks > 0 ? "brightness(1.1)" : "brightness(0.45)",
      () => ctx.drawImage(snap!, 0, 0),
    );
  }
  if (adj.clarity !== 0) {
    overlay(
      "overlay",
      Math.abs(adj.clarity) / 170,
      adj.clarity > 0 ? "contrast(1.7) saturate(0.8)" : "blur(1.8px) contrast(0.7)",
      () => ctx.drawImage(snap!, 0, 0),
    );
  }
  if (adj.dehaze > 0) {
    overlay("overlay", adj.dehaze / 180, "contrast(1.4) saturate(1.15)", () => ctx.drawImage(snap!, 0, 0));
  }
  if (adj.sharpness > 0) {
    overlay("overlay", adj.sharpness / 220, "contrast(2.1) blur(0.35px)", () => ctx.drawImage(snap!, 0, 0));
  }
  if (adj.bloom > 0) {
    overlay("screen", adj.bloom / 210, `blur(${3 + adj.bloom / 14}px) brightness(1.25)`, () =>
      ctx.drawImage(snap!, 0, 0),
    );
  }
  if (adj.vibrance > 0) {
    overlay("overlay", adj.vibrance / 240, "saturate(2)", () => ctx.drawImage(snap!, 0, 0));
  }

  if (adj.temperature !== 0) {
    const warm = adj.temperature > 0;
    const a = Math.abs(adj.temperature) / 280;
    overlay("soft-light", a, null, () => {
      ctx.fillStyle = warm ? "rgb(255,168,70)" : "rgb(70,150,255)";
      ctx.fillRect(0, 0, w, h);
    });
  }
  if (adj.tint !== 0) {
    overlay("soft-light", Math.abs(adj.tint) / 300, null, () => {
      ctx.fillStyle = adj.tint > 0 ? "rgb(80,220,120)" : "rgb(220,80,180)";
      ctx.fillRect(0, 0, w, h);
    });
  }

  const look = LOOKS.find((l) => l.id === layer.look.id);
  const amt = (layer.look.amount ?? 100) / 100;
  if (look && look.id !== "none" && amt > 0) {
    if (look.shadow) {
      overlay("soft-light", 0.85 * amt, null, () => {
        ctx.fillStyle = look.shadow!;
        ctx.fillRect(0, 0, w, h);
      });
    }
    if (look.mid) {
      overlay("overlay", 0.7 * amt, null, () => {
        ctx.fillStyle = look.mid!;
        ctx.fillRect(0, 0, w, h);
      });
    }
    if (look.high) {
      overlay("overlay", 0.75 * amt, null, () => {
        ctx.fillStyle = look.high!;
        ctx.fillRect(0, 0, w, h);
      });
    }
  }

  if (adj.duotone > 0 && adj.duoMap !== "none") {
    const duo = DUOTONES.find((d) => d.id === adj.duoMap);
    if (duo) {
      const a = adj.duotone / 100;
      overlay("color", a * 0.35, "grayscale(1)", () => ctx.drawImage(snap!, 0, 0));
      overlay("multiply", a * 0.55, null, () => {
        ctx.fillStyle = duo.shadow;
        ctx.fillRect(0, 0, w, h);
      });
      overlay("screen", a * 0.4, null, () => {
        ctx.fillStyle = duo.high;
        ctx.fillRect(0, 0, w, h);
      });
    }
  }

  if (adj.fade > 0) {
    overlay("screen", adj.fade / 180, null, () => {
      ctx.fillStyle = "rgb(48,46,44)";
      ctx.fillRect(0, 0, w, h);
    });
  }

  if (adj.vignette > 0) {
    overlay("multiply", Math.min(0.92, adj.vignette / 110), null, () => {
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.22, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.55, "rgba(0,0,0,0.15)");
      g.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  if (adj.grain > 0) {
    overlay("overlay", adj.grain / 160, null, () => {
      const pat = ctx.createPattern(getNoise(), "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, w, h);
      }
    });
  }

  if (layer.frameId && layer.frameId !== "none") {
    drawFrame(ctx, w, h, layer.frameId, layer.frameColor || "#f4efe6");
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-in";
  ctx.filter = "none";
  ctx.drawImage(layer.mask, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

export function computeAuto(image: HTMLImageElement): Partial<Adjustments> {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return {};
  ctx.drawImage(image, 0, 0, 64, 64);
  const d = ctx.getImageData(0, 0, 64, 64).data;
  let sum = 0;
  let min = 255;
  let max = 0;
  const n = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    sum += y;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  const mean = sum / n;
  const exposure = clamp((128 - mean) * 0.32, -36, 36);
  const contrast = clamp((170 - (max - min)) * 0.18, -8, 28);
  const shadows = mean < 90 ? 8 : 0;
  const highlights = mean > 170 ? -10 : 0;
  return {
    exposure: Math.round(exposure),
    contrast: Math.round(contrast),
    shadows: Math.round(shadows),
    highlights: Math.round(highlights),
  };
}
