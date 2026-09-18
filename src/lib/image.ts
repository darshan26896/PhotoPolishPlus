import type { Layer, TextProps } from "../types";
import { uid } from "./uid";
import { defaultAdjust, defaultLook } from "./adjust";
import { defaultText, rasterizeText } from "./text";

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

export async function loadFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImage(url);
}

export function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = source.width;
  c.height = source.height;
  const ctx = c.getContext("2d");
  if (ctx) ctx.drawImage(source, 0, 0);
  return c;
}

export function makeOpaqueMask(width: number, height: number): HTMLCanvasElement {
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  return mask;
}

export async function maybeDownscale(
  img: HTMLImageElement,
  maxEdge = 2200,
): Promise<HTMLImageElement> {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return img;
  const scale = maxEdge / edge;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w * scale));
  c.height = Math.max(1, Math.round(h * scale));
  const ctx = c.getContext("2d");
  if (!ctx) return img;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return canvasToImage(c);
}

export function canvasToImage(c: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    c.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not encode image"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not reload image"));
      img.src = url;
    }, "image/png");
  });
}

export function createLayer(
  image: HTMLImageElement,
  name: string,
  docW: number,
  docH: number,
  mode: "base" | "overlay",
): Layer {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const mask = makeOpaqueMask(width, height);

  let scale = 1;
  let x = docW / 2;
  let y = docH / 2;

  if (mode === "base") {
    x = width / 2;
    y = height / 2;
    scale = 1;
  } else if (docW > 0 && docH > 0) {
    const fit = Math.min((docW * 0.78) / width, (docH * 0.78) / height);
    scale = Number.isFinite(fit) && fit > 0 ? fit : 1;
  }

  const bitmap = canvasFromImage(image, width, height);

  return {
    id: uid("ly"),
    name: stripExt(name),
    kind: "image",
    image,
    bitmap,
    width,
    height,
    x,
    y,
    scale,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    blendMode: "source-over",
    mask,
    sprite: null,
    spriteDirty: true,
    adjust: defaultAdjust(),
    look: defaultLook(),
    flipX: false,
    flipY: false,
    frameId: "none",
    frameColor: "#f4efe6",
  };
}

export function canvasFromImage(image: CanvasImageSource, width: number, height: number) {
  const bitmap = document.createElement("canvas");
  bitmap.width = width;
  bitmap.height = height;
  const ctx = bitmap.getContext("2d");
  if (ctx) ctx.drawImage(image, 0, 0, width, height);
  return bitmap;
}

export function ensureBitmap(layer: Layer): HTMLCanvasElement {
  if (layer.bitmap && layer.bitmap.width === layer.width && layer.bitmap.height === layer.height) {
    return layer.bitmap;
  }
  const bitmap = canvasFromImage(layer.image, layer.width, layer.height);
  layer.bitmap = bitmap;
  return bitmap;
}

const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export function placeholderImage(): HTMLImageElement {
  const img = new Image();
  img.src = PIXEL;
  img.width = 1;
  img.height = 1;
  return img;
}

export function createDrawLayer(docW: number, docH: number): Layer {
  const width = Math.max(8, Math.round(docW));
  const height = Math.max(8, Math.round(docH));
  const bitmap = document.createElement("canvas");
  bitmap.width = width;
  bitmap.height = height;
  return {
    id: uid("ly"),
    name: "Drawing",
    kind: "draw",
    image: placeholderImage(),
    bitmap,
    width,
    height,
    x: width / 2,
    y: height / 2,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    blendMode: "source-over",
    mask: makeOpaqueMask(width, height),
    sprite: null,
    spriteDirty: true,
    adjust: defaultAdjust(),
    look: defaultLook(),
    flipX: false,
    flipY: false,
    frameId: "none",
    frameColor: "#f4efe6",
  };
}

export function createTextLayer(docW: number, docH: number, props?: Partial<TextProps>): Layer {
  const text = { ...defaultText(), ...props };
  const bitmap = rasterizeText(text);
  return {
    id: uid("ly"),
    name: text.text.slice(0, 22) || "Text",
    kind: "text",
    image: placeholderImage(),
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    x: docW / 2,
    y: docH / 2,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    blendMode: "source-over",
    mask: makeOpaqueMask(bitmap.width, bitmap.height),
    sprite: null,
    spriteDirty: true,
    adjust: defaultAdjust(),
    look: defaultLook(),
    flipX: false,
    flipY: false,
    text,
    frameId: "none",
    frameColor: "#f4efe6",
  };
}

export function stripExt(name: string) {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || "Layer";
}

export function layerThumb(layer: Layer, size = 72): string {
  try {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#1a1a1c";
    ctx.fillRect(0, 0, size, size);
    const src = layer.sprite ?? layer.image;
    const sw = "width" in src && src.width ? src.width : layer.width;
    const sh = "height" in src && src.height ? src.height : layer.height;
    const fit = Math.min(size / sw, size / sh);
    const dw = sw * fit;
    const dh = sh * fit;
    ctx.drawImage(src as CanvasImageSource, (size - dw) / 2, (size - dh) / 2, dw, dh);
    return c.toDataURL("image/jpeg", 0.6);
  } catch {
    return "";
  }
}
