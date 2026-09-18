export type Tool =
  | "move"
  | "erase"
  | "restore"
  | "wand"
  | "pan"
  | "clone"
  | "draw"
  | "text"
  | "mask"
  | "heal";

export type EditTab =
  | "layer"
  | "tone"
  | "color"
  | "looks"
  | "fx"
  | "cut"
  | "type"
  | "frame"
  | "collage"
  | "mask"
  | "size";

export type LayerKind = "image" | "text" | "draw";

export type BlendMode =
  | "source-over"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity"
  | "lighter";

export type DuoId = "none" | "sunset" | "moon" | "forest" | "ember" | "ice" | "rose";

export type MaskShape = "brush" | "gradient" | "rect" | "ellipse" | "heart";

export type DrawMode = "pen" | "marker" | "highlighter" | "pencil" | "eraser";

export interface Adjustments {
  exposure: number;
  brightness: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  saturation: number;
  vibrance: number;
  hue: number;
  clarity: number;
  dehaze: number;
  sharpness: number;
  blur: number;
  vignette: number;
  grain: number;
  fade: number;
  sepia: number;
  bloom: number;
  pixelate: number;
  bw: number;
  duotone: number;
  duoMap: DuoId;
}

export interface LayerLook {
  id: string;
  amount: number;
}

export interface TextProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  color: string;
  align: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffX: number;
  shadowOffY: number;
  underline: boolean;
  uppercase: boolean;
  bg: boolean;
  bgColor: string;
  bgPad: number;
}

export interface Layer {
  id: string;
  name: string;
  kind: LayerKind;
  image: HTMLImageElement;
  bitmap: HTMLCanvasElement;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;
  mask: HTMLCanvasElement;
  sprite: HTMLCanvasElement | null;
  spriteDirty: boolean;
  adjust: Adjustments;
  look: LayerLook;
  flipX: boolean;
  flipY: boolean;
  text?: TextProps;
  frameId: string;
  frameColor: string;
}

export interface Size {
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BrushSettings {
  size: number;
  hardness: number;
  opacity: number;
}

export interface DrawSettings {
  mode: DrawMode;
  color: string;
  size: number;
  opacity: number;
  hardness: number;
}

export interface CloneSource {
  layerId: string;
  x: number;
  y: number;
}

export interface DocBackground {
  mode: "transparent" | "color";
  color: string;
}
