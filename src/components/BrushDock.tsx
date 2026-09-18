import { useEditorContext } from "../editor/EditorContext";
import { Slider } from "./Slider";
import type { DrawMode, MaskShape } from "../types";
import { cn } from "../utils/cn";

const DRAW_MODES: { id: DrawMode; label: string }[] = [
  { id: "pen", label: "Pen" },
  { id: "marker", label: "Marker" },
  { id: "highlighter", label: "High" },
  { id: "pencil", label: "Pencil" },
  { id: "eraser", label: "Erase" },
];

const MASKS: { id: MaskShape; label: string }[] = [
  { id: "brush", label: "Brush" },
  { id: "gradient", label: "Fade" },
  { id: "rect", label: "Rect" },
  { id: "ellipse", label: "Oval" },
  { id: "heart", label: "Heart" },
];

export function BrushDock() {
  const {
    tool,
    brush,
    setBrush,
    wandTolerance,
    setWandTolerance,
    draw,
    setDraw,
    maskShape,
    setMaskShape,
    cloneSource,
  } = useEditorContext();

  if (
    tool !== "erase" &&
    tool !== "restore" &&
    tool !== "wand" &&
    tool !== "clone" &&
    tool !== "draw" &&
    tool !== "mask" &&
    tool !== "heal"
  )
    return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-[#121214]/90 px-5 py-3 shadow-2xl backdrop-blur-md">
        {tool === "wand" ? (
          <>
            <div className="min-w-0 flex-1">
              <Slider label="Wand tolerance" value={wandTolerance} min={4} max={90} onChange={setWandTolerance} />
            </div>
            <p className="hidden max-w-[200px] pb-1 text-[11px] text-stone-500 sm:block">
              Click a backdrop color. Alt reveals.
            </p>
          </>
        ) : tool === "draw" ? (
          <>
            <div className="flex flex-wrap gap-1 pb-1">
              {DRAW_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDraw({ ...draw, mode: m.id })}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px]",
                    draw.mode === m.id ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <input
              type="color"
              value={draw.color}
              onChange={(e) => setDraw({ ...draw, color: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <div className="min-w-0 flex-1">
              <Slider
                label="Size"
                value={draw.size}
                min={2}
                max={120}
                suffix="px"
                onChange={(size) => setDraw({ ...draw, size })}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Slider
                label="Flow"
                value={Math.round(draw.opacity * 100)}
                min={8}
                max={100}
                suffix="%"
                onChange={(v) => setDraw({ ...draw, opacity: v / 100 })}
              />
            </div>
          </>
        ) : tool === "clone" ? (
          <>
            <div className="min-w-0 flex-1">
              <Slider
                label="Stamp size"
                value={brush.size}
                min={8}
                max={220}
                suffix="px"
                onChange={(size) => setBrush({ ...brush, size })}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Slider
                label="Softness"
                value={Math.round((1 - brush.hardness) * 100)}
                min={0}
                max={100}
                suffix="%"
                onChange={(v) => setBrush({ ...brush, hardness: 1 - v / 100 })}
              />
            </div>
            <p className="hidden max-w-[240px] pb-1 text-[11px] leading-snug text-stone-500 sm:block">
              {cloneSource
                ? "Teal IN is the source. Gold OUT is where you paint."
                : "Click to plant the teal IN mark, then paint with the gold OUT circle."}
            </p>
          </>
        ) : tool === "heal" ? (
          <>
            <div className="min-w-0 flex-1">
              <Slider
                label="Brush"
                value={brush.size}
                min={12}
                max={220}
                suffix="px"
                onChange={(size) => setBrush({ ...brush, size })}
              />
            </div>
            <p className="hidden max-w-[260px] pb-1 text-[11px] leading-snug text-stone-500 sm:block">
              Paint over a blemish or object, then release — AI fills from the surrounding pixels.
            </p>
          </>
        ) : tool === "mask" ? (
          <>
            <div className="flex flex-wrap gap-1 pb-1">
              {MASKS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaskShape(m.id)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px]",
                    maskShape === m.id ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {maskShape === "brush" && (
              <div className="min-w-0 flex-1">
                <Slider
                  label="Size"
                  value={brush.size}
                  min={4}
                  max={260}
                  suffix="px"
                  onChange={(size) => setBrush({ ...brush, size })}
                />
              </div>
            )}
            <p className="hidden max-w-[200px] pb-1 text-[11px] text-stone-500 sm:block">
              {maskShape === "brush"
                ? "Paint to hide. Alt reveals."
                : "Drag across the photo to cut a matte."}
            </p>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <Slider
                label="Size"
                value={brush.size}
                min={4}
                max={260}
                suffix="px"
                onChange={(size) => setBrush({ ...brush, size })}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Slider
                label="Hardness"
                value={Math.round(brush.hardness * 100)}
                min={0}
                max={100}
                suffix="%"
                onChange={(v) => setBrush({ ...brush, hardness: v / 100 })}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Slider
                label="Flow"
                value={Math.round(brush.opacity * 100)}
                min={5}
                max={100}
                suffix="%"
                onChange={(v) => setBrush({ ...brush, opacity: v / 100 })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
