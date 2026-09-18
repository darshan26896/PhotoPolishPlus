import type { TextProps } from "../types";

export const FONT_LIST: { family: string; label: string }[] = [
  { family: "Outfit", label: "Outfit" },
  { family: "Fraunces", label: "Fraunces" },
  { family: "Playfair Display", label: "Playfair" },
  { family: "Cinzel", label: "Cinzel" },
  { family: "Cormorant Garamond", label: "Cormorant" },
  { family: "DM Serif Display", label: "DM Serif" },
  { family: "Libre Baskerville", label: "Baskerville" },
  { family: "Lora", label: "Lora" },
  { family: "Merriweather", label: "Merriweather" },
  { family: "Abril Fatface", label: "Abril" },
  { family: "Bebas Neue", label: "Bebas" },
  { family: "Oswald", label: "Oswald" },
  { family: "Anton", label: "Anton" },
  { family: "Archivo Black", label: "Archivo" },
  { family: "Barlow Condensed", label: "Barlow" },
  { family: "Montserrat", label: "Montserrat" },
  { family: "Poppins", label: "Poppins" },
  { family: "Raleway", label: "Raleway" },
  { family: "Unbounded", label: "Unbounded" },
  { family: "Righteous", label: "Righteous" },
  { family: "Russo One", label: "Russo" },
  { family: "Orbitron", label: "Orbitron" },
  { family: "Pacifico", label: "Pacifico" },
  { family: "Great Vibes", label: "Great Vibes" },
  { family: "Dancing Script", label: "Dancing" },
  { family: "Satisfy", label: "Satisfy" },
  { family: "Permanent Marker", label: "Marker" },
  { family: "Lobster", label: "Lobster" },
  { family: "Special Elite", label: "Typewriter" },
  { family: "Shadows Into Light", label: "Shadows" },
  { family: "Georgia", label: "Georgia" },
  { family: "Times New Roman", label: "Times" },
  { family: "Garamond", label: "Garamond" },
  { family: "Palatino Linotype", label: "Palatino" },
  { family: "Impact", label: "Impact" },
  { family: "Arial Black", label: "Arial Black" },
  { family: "Trebuchet MS", label: "Trebuchet" },
  { family: "Courier New", label: "Courier" },
  { family: "Verdana", label: "Verdana" },
  { family: "Comic Sans MS", label: "Comic" },
];

export function defaultText(text = "Your text"): TextProps {
  return {
    text,
    fontFamily: "Fraunces",
    fontSize: 72,
    fontWeight: 600,
    italic: false,
    color: "#f4efe6",
    align: "center",
    letterSpacing: 0,
    lineHeight: 1.15,
    stroke: false,
    strokeColor: "#111111",
    strokeWidth: 4,
    shadow: true,
    shadowColor: "rgba(0,0,0,0.45)",
    shadowBlur: 12,
    shadowOffX: 0,
    shadowOffY: 6,
    underline: false,
    uppercase: false,
    bg: false,
    bgColor: "rgba(0,0,0,0.55)",
    bgPad: 18,
  };
}

export interface TextStyle {
  id: string;
  name: string;
  patch: Partial<TextProps>;
}

export const TEXT_STYLES: TextStyle[] = [
  { id: "classic", name: "Classic", patch: { fontFamily: "Fraunces", fontWeight: 600, italic: false, color: "#f4efe6", stroke: false, shadow: true, bg: false, uppercase: false } },
  { id: "goldserif", name: "Gold Serif", patch: { fontFamily: "Cinzel", fontWeight: 700, color: "#e2c48a", stroke: false, shadow: true, shadowColor: "rgba(80,50,10,0.5)", uppercase: true, letterSpacing: 4 } },
  { id: "editorial", name: "Editorial", patch: { fontFamily: "Playfair Display", italic: true, fontWeight: 500, color: "#f7f1e6", stroke: false, shadow: false, letterSpacing: 0 } },
  { id: "noir", name: "Noir Title", patch: { fontFamily: "Cinzel", uppercase: true, letterSpacing: 8, color: "#f0e6d4", fontWeight: 700, shadow: true } },
  { id: "impact", name: "Impact", patch: { fontFamily: "Anton", uppercase: true, color: "#ffffff", stroke: true, strokeColor: "#111", strokeWidth: 6, shadow: false, letterSpacing: 1 } },
  { id: "bebas", name: "Poster", patch: { fontFamily: "Bebas Neue", uppercase: true, letterSpacing: 6, color: "#ff3b2f", stroke: false, shadow: true } },
  { id: "yellow", name: "Block Yellow", patch: { fontFamily: "Archivo Black", uppercase: true, color: "#ffe14a", stroke: true, strokeColor: "#111", strokeWidth: 5 } },
  { id: "outline", name: "Outline", patch: { fontFamily: "Oswald", color: "transparent", stroke: true, strokeColor: "#f4efe6", strokeWidth: 3, shadow: false, uppercase: true, letterSpacing: 3 } },
  { id: "outlinegold", name: "Gold Line", patch: { fontFamily: "Cinzel", color: "transparent", stroke: true, strokeColor: "#d4b483", strokeWidth: 2, uppercase: true, letterSpacing: 6 } },
  { id: "neonpink", name: "Neon Pink", patch: { fontFamily: "Russo One", color: "#ff4fd8", shadow: true, shadowColor: "#ff4fd8", shadowBlur: 22, shadowOffY: 0, stroke: false } },
  { id: "neoncyan", name: "Neon Cyan", patch: { fontFamily: "Orbitron", color: "#5ef0ff", shadow: true, shadowColor: "#5ef0ff", shadowBlur: 22, shadowOffY: 0, fontWeight: 700 } },
  { id: "neongold", name: "Neon Gold", patch: { fontFamily: "Unbounded", color: "#ffd36a", shadow: true, shadowColor: "#ffb000", shadowBlur: 18, shadowOffY: 0 } },
  { id: "script", name: "Script Rose", patch: { fontFamily: "Great Vibes", italic: false, color: "#f3b6c8", fontSize: 92, shadow: true, stroke: false, uppercase: false } },
  { id: "pacifico", name: "Pacifico", patch: { fontFamily: "Pacifico", color: "#fff4e0", shadow: true, fontSize: 80 } },
  { id: "dancing", name: "Dancing", patch: { fontFamily: "Dancing Script", color: "#f0d9a8", fontWeight: 700, italic: false } },
  { id: "satisfy", name: "Satisfy", patch: { fontFamily: "Satisfy", color: "#ffe0c2", shadow: true } },
  { id: "marker", name: "Marker", patch: { fontFamily: "Permanent Marker", color: "#111111", bg: true, bgColor: "#ffe14a", bgPad: 16, shadow: false } },
  { id: "graffiti", name: "Graffiti", patch: { fontFamily: "Permanent Marker", color: "#ff4d3a", stroke: true, strokeColor: "#111", strokeWidth: 4, shadow: true } },
  { id: "typewriter", name: "Typewriter", patch: { fontFamily: "Special Elite", color: "#2a2118", bg: true, bgColor: "#efe6d2", uppercase: false, shadow: false, letterSpacing: 1 } },
  { id: "courier", name: "Mono", patch: { fontFamily: "Courier New", color: "#d4f7c8", bg: true, bgColor: "#111", bgPad: 12, letterSpacing: 1 } },
  { id: "lower", name: "Lower Third", patch: { fontFamily: "Oswald", uppercase: true, color: "#111", bg: true, bgColor: "#f0d9a8", bgPad: 14, letterSpacing: 4, shadow: false } },
  { id: "subtitle", name: "Subtitle", patch: { fontFamily: "Outfit", color: "#fff", bg: true, bgColor: "rgba(0,0,0,0.62)", bgPad: 12, shadow: false, fontWeight: 500 } },
  { id: "watermark", name: "Watermark", patch: { fontFamily: "Cinzel", color: "rgba(255,255,255,0.35)", uppercase: true, letterSpacing: 10, shadow: false, stroke: false } },
  { id: "quote", name: "Quote", patch: { fontFamily: "Playfair Display", italic: true, color: "#f7f1e6", shadow: true } },
  { id: "magazine", name: "Magazine", patch: { fontFamily: "Abril Fatface", color: "#f4efe6", italic: false, shadow: true } },
  { id: "thin", name: "Thin Modern", patch: { fontFamily: "Raleway", fontWeight: 300, letterSpacing: 8, uppercase: true, color: "#f4efe6", shadow: false } },
  { id: "condensed", name: "Condensed", patch: { fontFamily: "Barlow Condensed", uppercase: true, letterSpacing: 5, color: "#fff", fontWeight: 600 } },
  { id: "oswald", name: "Oswald", patch: { fontFamily: "Oswald", color: "#f4efe6", uppercase: true, letterSpacing: 3 } },
  { id: "brutal", name: "Brutalist", patch: { fontFamily: "Anton", color: "#111", bg: true, bgColor: "#f4efe6", uppercase: true, bgPad: 20, shadow: false } },
  { id: "ice", name: "Ice", patch: { fontFamily: "Montserrat", color: "#d9f4ff", shadow: true, shadowColor: "#7ad7ff", shadowBlur: 16, shadowOffY: 0, fontWeight: 700 } },
  { id: "fire", name: "Fire", patch: { fontFamily: "Anton", color: "#ffb347", shadow: true, shadowColor: "#ff4d00", shadowBlur: 18, shadowOffY: 0, uppercase: true } },
  { id: "forest", name: "Forest", patch: { fontFamily: "Lora", color: "#c6e48b", italic: true, shadow: true } },
  { id: "royal", name: "Royal", patch: { fontFamily: "Cinzel", color: "#d6b6ff", uppercase: true, letterSpacing: 6, shadow: true, shadowColor: "#4a2080" } },
  { id: "candy", name: "Candy", patch: { fontFamily: "Poppins", fontWeight: 700, color: "#ff8fab", stroke: true, strokeColor: "#fff", strokeWidth: 4 } },
  { id: "crimson", name: "Crimson", patch: { fontFamily: "Playfair Display", color: "#e07070", italic: true, fontWeight: 700 } },
  { id: "navy", name: "Navy Serif", patch: { fontFamily: "Libre Baskerville", color: "#dce7ff", italic: false } },
  { id: "cream", name: "Cream", patch: { fontFamily: "Cormorant Garamond", color: "#efe6d4", italic: true, fontWeight: 600, fontSize: 84 } },
  { id: "blackletter", name: "Display Fat", patch: { fontFamily: "Abril Fatface", color: "#111", bg: true, bgColor: "#e2c48a", bgPad: 16 } },
  { id: "pop", name: "Comic Pop", patch: { fontFamily: "Comic Sans MS", color: "#111", stroke: true, strokeColor: "#fff", strokeWidth: 5, shadow: true, shadowOffX: 4, shadowOffY: 4, shadowBlur: 0, shadowColor: "#111" } },
  { id: "hardshadow", name: "Hard Shadow", patch: { fontFamily: "Oswald", color: "#fff", shadow: true, shadowBlur: 0, shadowOffX: 6, shadowOffY: 6, shadowColor: "#111", uppercase: true } },
  { id: "softglow", name: "Soft Glow", patch: { fontFamily: "Poppins", color: "#fff", shadow: true, shadowBlur: 24, shadowOffY: 0, shadowColor: "rgba(255,240,200,0.8)", fontWeight: 600 } },
  { id: "stamp", name: "Stamp", patch: { fontFamily: "Special Elite", color: "#8b1e1e", uppercase: true, letterSpacing: 4, stroke: true, strokeColor: "#8b1e1e", strokeWidth: 1, rotate: 0 } as Partial<TextProps> },
  { id: "ticket", name: "Ticket", patch: { fontFamily: "Bebas Neue", color: "#1a1a1a", bg: true, bgColor: "#f4efe6", letterSpacing: 5, uppercase: true } },
  { id: "film", name: "Film Credit", patch: { fontFamily: "Cinzel", color: "#f0d9a8", letterSpacing: 10, uppercase: true, fontWeight: 500, shadow: true } },
  { id: "western", name: "Western", patch: { fontFamily: "Cinzel", color: "#e8c078", uppercase: true, letterSpacing: 7, stroke: true, strokeColor: "#3a2208", strokeWidth: 3 } },
  { id: "techno", name: "Techno", patch: { fontFamily: "Orbitron", color: "#9fffd3", uppercase: true, letterSpacing: 4, fontWeight: 700, shadow: true, shadowColor: "#2aff9a" } },
  { id: "righteous", name: "Righteous", patch: { fontFamily: "Righteous", color: "#fff4d6", shadow: true } },
  { id: "lobster", name: "Lobster", patch: { fontFamily: "Lobster", color: "#ffd1c1", shadow: true } },
  { id: "hand", name: "Hand", patch: { fontFamily: "Shadows Into Light", color: "#f4efe6", fontSize: 84, shadow: false } },
  { id: "georgia", name: "Georgia", patch: { fontFamily: "Georgia", italic: true, color: "#f0e6d4" } },
  { id: "times", name: "Times", patch: { fontFamily: "Times New Roman", color: "#f4efe6", italic: true } },
  { id: "palatino", name: "Palatino", patch: { fontFamily: "Palatino Linotype", color: "#eadcc8", italic: true } },
  { id: "invert", name: "Invert Box", patch: { fontFamily: "Montserrat", fontWeight: 700, color: "#111", bg: true, bgColor: "#f4efe6", uppercase: true, letterSpacing: 3 } },
  { id: "pill", name: "Pill Label", patch: { fontFamily: "Outfit", fontWeight: 600, color: "#1a1a1a", bg: true, bgColor: "#d4b483", bgPad: 16, uppercase: true, letterSpacing: 3 } },
  { id: "sky", name: "Sky", patch: { fontFamily: "Poppins", color: "#9ad8ff", fontWeight: 700, shadow: true, shadowColor: "#3aa0ff" } },
  { id: "sage", name: "Sage", patch: { fontFamily: "Lora", color: "#c9d7c2", italic: true } },
  { id: "amber", name: "Amber", patch: { fontFamily: "Merriweather", color: "#ffb060", fontWeight: 700 } },
  { id: "double", name: "Double Stroke", patch: { fontFamily: "Oswald", color: "#111", stroke: true, strokeColor: "#f0d9a8", strokeWidth: 7, uppercase: true } },
  { id: "pastel", name: "Pastel", patch: { fontFamily: "Poppins", color: "#ffd6e8", fontWeight: 600, shadow: false } },
  { id: "code", name: "Code", patch: { fontFamily: "Courier New", color: "#7dffb3", bg: true, bgColor: "#0b1210", bgPad: 10, letterSpacing: 0 } },
];

export async function ensureFont(family: string, weight = 600, size = 72) {
  try {
    if (document.fonts?.load) {
      await document.fonts.load(`${weight} ${size}px "${family}"`);
    }
  } catch {
    /* system fallback */
  }
}

export function rasterizeText(props: TextProps): HTMLCanvasElement {
  const raw = props.uppercase ? props.text.toUpperCase() : props.text;
  const lines = (raw || " ").split("\n");
  const font = `${props.italic ? "italic" : "normal"} ${props.fontWeight} ${props.fontSize}px "${props.fontFamily}", serif`;
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return document.createElement("canvas");
  measure.font = font;
  measure.letterSpacing = `${props.letterSpacing}px`;
  let maxW = 0;
  for (const line of lines) {
    maxW = Math.max(maxW, measure.measureText(line).width);
  }
  const lh = props.fontSize * props.lineHeight;
  const pad = (props.bg ? props.bgPad : 8) + (props.stroke ? props.strokeWidth + 2 : 8) + 16;
  const shadowExtra = props.shadow ? props.shadowBlur + Math.abs(props.shadowOffX) + Math.abs(props.shadowOffY) : 0;
  const w = Math.max(32, Math.ceil(maxW + pad * 2 + shadowExtra * 2));
  const h = Math.max(32, Math.ceil(lines.length * lh + pad * 2 + shadowExtra * 2));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.font = font;
  ctx.letterSpacing = `${props.letterSpacing}px`;
  ctx.textBaseline = "middle";
  ctx.textAlign = props.align;
  const x =
    props.align === "left" ? pad : props.align === "right" ? w - pad : w / 2;
  if (props.bg) {
    ctx.fillStyle = props.bgColor;
    const bw = maxW + props.bgPad * 2;
    const bh = lines.length * lh + props.bgPad * 2;
    const bx = (w - bw) / 2;
    const by = (h - bh) / 2;
    roundRect(ctx, bx, by, bw, bh, 10);
    ctx.fill();
  }
  if (props.shadow) {
    ctx.shadowColor = props.shadowColor;
    ctx.shadowBlur = props.shadowBlur;
    ctx.shadowOffsetX = props.shadowOffX;
    ctx.shadowOffsetY = props.shadowOffY;
  }
  lines.forEach((line, i) => {
    const y = pad + shadowExtra + lh * i + lh / 2;
    if (props.stroke && props.strokeWidth > 0) {
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
      ctx.strokeText(line, x, y);
    }
    if (props.color !== "transparent") {
      ctx.fillStyle = props.color;
      ctx.fillText(line, x, y);
    }
    if (props.underline) {
      const tw = ctx.measureText(line).width;
      const ux = props.align === "left" ? x : props.align === "right" ? x - tw : x - tw / 2;
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = props.color === "transparent" ? props.strokeColor : props.color;
      ctx.lineWidth = Math.max(1, props.fontSize / 18);
      ctx.beginPath();
      ctx.moveTo(ux, y + props.fontSize * 0.42);
      ctx.lineTo(ux + tw, y + props.fontSize * 0.42);
      ctx.stroke();
    }
  });
  return c;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
