import type { BlendMode } from "../types";

export const BLEND_MODES: { id: BlendMode; label: string; hint: string }[] = [
  { id: "source-over", label: "Normal", hint: "Standard stack" },
  { id: "multiply", label: "Multiply", hint: "Darken, shadows, print" },
  { id: "screen", label: "Screen", hint: "Light leaks, glow" },
  { id: "overlay", label: "Overlay", hint: "Contrast double-exposure" },
  { id: "soft-light", label: "Soft Light", hint: "Gentle photographic blend" },
  { id: "hard-light", label: "Hard Light", hint: "Punchy overlay" },
  { id: "darken", label: "Darken", hint: "Keep the darker pixels" },
  { id: "lighten", label: "Lighten", hint: "Keep the brighter pixels" },
  { id: "color-dodge", label: "Color Dodge", hint: "Bleach and shine" },
  { id: "color-burn", label: "Color Burn", hint: "Deepen color" },
  { id: "lighter", label: "Add", hint: "Linear dodge / fire & sparks" },
  { id: "difference", label: "Difference", hint: "Experimental inversion" },
  { id: "exclusion", label: "Exclusion", hint: "Softer difference" },
  { id: "hue", label: "Hue", hint: "Borrow color hue" },
  { id: "saturation", label: "Saturation", hint: "Borrow saturation" },
  { id: "color", label: "Color", hint: "Hue + saturation" },
  { id: "luminosity", label: "Luminosity", hint: "Borrow light only" },
];

export const OVERLAY_PRESETS: {
  id: string;
  label: string;
  blendMode: BlendMode;
  opacity: number;
}[] = [
  { id: "double", label: "Double exp.", blendMode: "overlay", opacity: 58 },
  { id: "shadow", label: "Shadow", blendMode: "multiply", opacity: 42 },
  { id: "leak", label: "Light leak", blendMode: "screen", opacity: 48 },
  { id: "glow", label: "Soft glow", blendMode: "soft-light", opacity: 70 },
  { id: "add", label: "Sparks", blendMode: "lighter", opacity: 36 },
  { id: "texture", label: "Texture", blendMode: "overlay", opacity: 34 },
];
