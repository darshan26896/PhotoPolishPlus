import {
  Aperture,
  Droplets,
  FlipHorizontal,
  FlipVertical,
  Frame,
  LayoutGrid,
  Layers,
  LocateFixed,
  MonitorPlay,
  Maximize2,
  Palette,
  RotateCcw,
  RotateCw,
  Sparkles,
  SquareDashed,
  SunMedium,
  Type,
  Wand2,
} from "lucide-react";
import { useEditorContext } from "../editor/EditorContext";
import { BLEND_MODES, OVERLAY_PRESETS } from "../lib/blend";
import { DUOTONES, LOOKS, defaultAdjust } from "../lib/adjust";
import { FONT_LIST, TEXT_STYLES } from "../lib/text";
import { FRAMES } from "../lib/frames";
import { COLLAGES, autoCells } from "../lib/collage";
import { CANVAS_FORMATS, FORMAT_GROUPS, formatById } from "../lib/formats";
import { Slider } from "./Slider";
import { cn } from "../utils/cn";
import type { Adjustments, DuoId, EditTab } from "../types";

const TABS: { id: EditTab; label: string; icon: typeof SunMedium }[] = [
  { id: "looks", label: "Looks", icon: Palette },
  { id: "tone", label: "Tone", icon: SunMedium },
  { id: "color", label: "Color", icon: Droplets },
  { id: "fx", label: "FX", icon: Aperture },
  { id: "type", label: "Type", icon: Type },
  { id: "frame", label: "Frame", icon: Frame },
  { id: "size", label: "Size", icon: MonitorPlay },
  { id: "collage", label: "Grid", icon: LayoutGrid },
  { id: "mask", label: "Mask", icon: SquareDashed },
  { id: "layer", label: "Layer", icon: Layers },
  { id: "cut", label: "Cut", icon: Wand2 },
];

export function Inspector() {
  const {
    selected,
    editTab,
    setEditTab,
    paper,
    setPaper,
    setBypass,
  } = useEditorContext();

  return (
    <section className="flex min-h-0 flex-col">
      <div className="grid grid-cols-6 gap-0.5 border-b border-white/10 px-1.5 py-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = editTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => setEditTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[8px] uppercase tracking-[0.12em] transition",
                on ? "bg-gold/15 text-gold" : "text-stone-500 hover:bg-white/5 hover:text-stone-300",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3">
        {selected && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
              {selected.name}
            </h2>
            <button
              type="button"
              className="lumina-btn px-2 py-0.5 text-[9px]"
              onPointerDown={() => setBypass(true)}
              onPointerUp={() => setBypass(false)}
              onPointerLeave={() => setBypass(false)}
              title="Hold to see the original (\\)"
            >
              Before
            </button>
          </div>
        )}
        {!selected && editTab !== "collage" && editTab !== "type" && editTab !== "size" ? (
          <>
            <p className="text-xs leading-relaxed text-stone-600">
              Select a layer — or open Size / Grid / Type for canvas formats, collages, and lettering.
            </p>
            <PaperControls paper={paper} setPaper={setPaper} />
          </>
        ) : (
          <>
            {editTab === "looks" && selected && <LooksTab />}
            {editTab === "tone" && selected && <ToneTab />}
            {editTab === "color" && selected && <ColorTab />}
            {editTab === "fx" && selected && <FxTab />}
            {editTab === "type" && <TypeTab />}
            {editTab === "frame" && selected && <FrameTab />}
            {editTab === "size" && <SizeTab />}
            {editTab === "collage" && <CollageTab />}
            {editTab === "mask" && selected && <MaskTab />}
            {editTab === "layer" && selected && <LayerTab />}
            {editTab === "cut" && selected && <CutTab />}
          </>
        )}
      </div>
    </section>
  );
}

function signed(v: number, suffix = "") {
  const n = Math.round(v * 10) / 10;
  return `${n > 0 ? "+" : ""}${n}${suffix}`;
}

function Adj({
  k,
  label,
  min,
  max,
  step = 1,
  suffix = "",
  gold,
}: {
  k: keyof Adjustments;
  label: string;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  gold?: boolean;
}) {
  const { selected, setAdjust, commit } = useEditorContext();
  if (!selected) return null;
  const adj = selected.adjust ?? defaultAdjust();
  const value = adj[k];
  if (typeof value !== "number") return null;
  return (
    <Slider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      gold={gold}
      display={signed(value, suffix)}
      onChange={(v) => setAdjust(selected.id, { [k]: v })}
      onBegin={commit}
    />
  );
}

function LooksTab() {
  const { selected, setLook, commit, resetAdjust, autoTone } = useEditorContext();
  if (!selected) return null;
  return (
    <div>
      <div className="mb-2 flex gap-1">
        <Ghost onClick={() => autoTone(selected.id)}>Auto tone</Ghost>
        <Ghost onClick={() => resetAdjust(selected.id)}>Reset all</Ghost>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {LOOKS.map((look) => {
          const on = selected.look.id === look.id;
          return (
            <button
              key={look.id}
              type="button"
              onClick={() => {
                commit();
                setLook(selected.id, {
                  id: on && look.id !== "none" ? "none" : look.id,
                  amount: 100,
                });
              }}
              className={cn(
                "group relative aspect-[5/4] overflow-hidden rounded-lg border text-left",
                on ? "border-gold ring-1 ring-gold/40" : "border-white/10 hover:border-white/25",
              )}
            >
              <div className="absolute inset-0" style={{ background: look.swatch }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-1 left-1.5 font-serif text-[11px] text-stone-50">
                {look.name}
              </span>
            </button>
          );
        })}
      </div>
      {selected.look.id !== "none" && (
        <div className="mt-3">
          <Slider
            label="Look intensity"
            value={selected.look.amount}
            min={0}
            max={100}
            suffix="%"
            gold
            onChange={(v) => setLook(selected.id, { ...selected.look, amount: v })}
            onBegin={commit}
          />
        </div>
      )}
    </div>
  );
}

function ToneTab() {
  const { selected, autoTone, commit, setAdjust } = useEditorContext();
  if (!selected) return null;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <Ghost onClick={() => autoTone(selected.id)}>
          <Sparkles className="h-3 w-3" /> Auto
        </Ghost>
        <Ghost
          onClick={() => {
            commit();
            const z = defaultAdjust();
            setAdjust(selected.id, {
              exposure: z.exposure,
              brightness: z.brightness,
              contrast: z.contrast,
              highlights: z.highlights,
              shadows: z.shadows,
              whites: z.whites,
              blacks: z.blacks,
              clarity: z.clarity,
              dehaze: z.dehaze,
            });
          }}
        >
          Reset tone
        </Ghost>
      </div>
      <Adj k="exposure" label="Exposure" min={-100} max={100} gold />
      <Adj k="brightness" label="Brightness" min={-100} max={100} />
      <Adj k="contrast" label="Contrast" min={-100} max={100} />
      <Adj k="highlights" label="Highlights" min={-100} max={100} />
      <Adj k="shadows" label="Shadows" min={-100} max={100} />
      <Adj k="whites" label="Whites" min={-100} max={100} />
      <Adj k="blacks" label="Blacks" min={-100} max={100} />
      <Adj k="clarity" label="Clarity" min={-100} max={100} />
      <Adj k="dehaze" label="Dehaze" min={-50} max={80} />
    </div>
  );
}

function ColorTab() {
  const { selected, commit, setAdjust } = useEditorContext();
  if (!selected) return null;
  return (
    <div className="space-y-3">
      <Ghost
        onClick={() => {
          commit();
          const z = defaultAdjust();
          setAdjust(selected.id, {
            temperature: z.temperature,
            tint: z.tint,
            saturation: z.saturation,
            vibrance: z.vibrance,
            hue: z.hue,
            sepia: z.sepia,
            bw: z.bw,
          });
        }}
      >
        Reset color
      </Ghost>
      <Adj k="temperature" label="Temperature" min={-100} max={100} gold />
      <Adj k="tint" label="Tint" min={-100} max={100} />
      <Adj k="saturation" label="Saturation" min={-100} max={100} />
      <Adj k="vibrance" label="Vibrance" min={-100} max={100} />
      <Adj k="hue" label="Hue" min={-180} max={180} suffix="°" />
      <Adj k="sepia" label="Sepia" min={0} max={100} suffix="%" />
      <Adj k="bw" label="Black & white" min={0} max={100} suffix="%" />
    </div>
  );
}

function FxTab() {
  const { selected, commit, setAdjust } = useEditorContext();
  if (!selected) return null;
  const adj = selected.adjust ?? defaultAdjust();
  return (
    <div className="space-y-3">
      <Adj k="vignette" label="Vignette" min={0} max={100} suffix="%" gold />
      <Adj k="grain" label="Film grain" min={0} max={100} suffix="%" />
      <Adj k="fade" label="Fade / matte" min={0} max={100} suffix="%" />
      <Adj k="bloom" label="Bloom" min={0} max={100} suffix="%" />
      <Adj k="blur" label="Soft blur" min={0} max={12} step={0.1} suffix="px" />
      <Adj k="sharpness" label="Sharpen" min={0} max={100} suffix="%" />
      <Adj k="pixelate" label="Pixelate" min={0} max={48} suffix="px" />
      <label className="block">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
          Duotone map
        </div>
        <select
          value={adj.duoMap}
          onChange={(e) => {
            commit();
            const duoMap = e.target.value as DuoId;
            setAdjust(selected.id, { duoMap, duotone: duoMap === "none" ? 0 : Math.max(adj.duotone, 55) });
          }}
          className="lumina-select w-full"
        >
          {DUOTONES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      {adj.duoMap !== "none" && <Adj k="duotone" label="Duotone mix" min={0} max={100} suffix="%" />}
    </div>
  );
}

function LayerTab() {
  const { selected, updateLayer, setOpacity, setBlend, commit, doc, flipLayer } = useEditorContext();
  if (!selected) return null;
  return (
    <div>
      <Slider
        label="Visibility"
        value={selected.opacity}
        min={0}
        max={100}
        suffix="%"
        gold
        onChange={(v) => setOpacity(selected.id, v)}
        onBegin={commit}
      />
      <label className="mt-4 block">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
          Blend mode
        </div>
        <select
          value={selected.blendMode}
          onChange={(e) => {
            commit();
            setBlend(selected.id, e.target.value as typeof selected.blendMode);
          }}
          className="lumina-select w-full"
        >
          {BLEND_MODES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-3 flex flex-wrap gap-1">
        {OVERLAY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              commit();
              updateLayer(selected.id, { blendMode: p.blendMode, opacity: p.opacity });
            }}
            className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-stone-400 hover:border-gold/30 hover:text-gold"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Slider
          label="Scale"
          value={Math.round(Math.abs(selected.scale) * 100)}
          min={5}
          max={300}
          suffix="%"
          onChange={(v) => updateLayer(selected.id, { scale: v / 100 })}
          onBegin={commit}
        />
        <Slider
          label="Rotate"
          value={Math.round(selected.rotation)}
          min={-180}
          max={180}
          suffix="°"
          onChange={(v) => updateLayer(selected.id, { rotation: v })}
          onBegin={commit}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1">
        <Ghost
          title="Flip horizontal"
          onClick={() => flipLayer("x")}
        >
          <FlipHorizontal className="h-3.5 w-3.5" />
          Flip H
        </Ghost>
        <Ghost title="Flip vertical" onClick={() => flipLayer("y")}>
          <FlipVertical className="h-3.5 w-3.5" />
          Flip V
        </Ghost>
        <Ghost
          title="Center"
          onClick={() => {
            commit();
            updateLayer(selected.id, { x: doc.w / 2, y: doc.h / 2 });
          }}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Center
        </Ghost>
        <Ghost
          title="Fit"
          onClick={() => {
            commit();
            const s = Math.min(doc.w / selected.width, doc.h / selected.height);
            updateLayer(selected.id, { scale: s, x: doc.w / 2, y: doc.h / 2, rotation: 0 });
          }}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Fit
        </Ghost>
      </div>
      <div className="mt-2 flex gap-1">
        <Ghost
          onClick={() => {
            commit();
            updateLayer(selected.id, { rotation: selected.rotation - 90 });
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          −90°
        </Ghost>
        <Ghost
          onClick={() => {
            commit();
            updateLayer(selected.id, { rotation: selected.rotation + 90 });
          }}
        >
          <RotateCw className="h-3.5 w-3.5" />
          +90°
        </Ghost>
      </div>
    </div>
  );
}

function CutTab() {
  const {
    selected,
    applyAutoRemove,
    applyResetMask,
    applyInvertMask,
    applyFeather,
    aiBusy,
    aiStage,
    aiThreshold,
    setAiThreshold,
    aiFeather,
    setAiFeather,
    paper,
    setPaper,
  } = useEditorContext();
  if (!selected) return null;
  return (
    <div>
      <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">
          <Sparkles className="h-3 w-3" />
          Background
        </div>
        <button
          type="button"
          disabled={aiBusy || selected.locked}
          onClick={applyAutoRemove}
          className="lumina-btn-gold w-full justify-center"
        >
          <Wand2 className="h-3.5 w-3.5" />
          {aiBusy ? aiStage || "Working…" : "Auto remove background"}
        </button>
        <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
          Isolates the subject, then feathers the matte. Finish hair with Erase / Reveal.
        </p>
        <div className="mt-3 space-y-3">
          <Slider
            label="Sensitivity"
            value={aiThreshold}
            min={0.12}
            max={0.7}
            step={0.01}
            display={Math.round(aiThreshold * 100) + "%"}
            onChange={setAiThreshold}
          />
          <Slider
            label="Edge feather"
            value={aiFeather}
            min={0.2}
            max={4}
            step={0.1}
            display={aiFeather.toFixed(1) + "px"}
            onChange={setAiFeather}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1">
          <Ghost onClick={applyResetMask}>Reset</Ghost>
          <Ghost onClick={applyInvertMask}>Invert</Ghost>
          <Ghost onClick={() => applyFeather(2.4)}>Soften</Ghost>
        </div>
      </div>
      <PaperControls paper={paper} setPaper={setPaper} />
    </div>
  );
}

function TypeTab() {
  const { selected, addTextLayer, updateText, setTool } = useEditorContext();
  const t = selected?.kind === "text" ? selected.text : null;
  return (
    <div className="space-y-3">
      <Ghost
        onClick={() => {
          addTextLayer();
          setTool("move");
        }}
      >
        + New text
      </Ghost>
      {!t ? (
        <p className="text-[11px] leading-relaxed text-stone-500">
          Add a text layer, then pick one of 50+ styles, a typeface, and color.
        </p>
      ) : (
        <>
          <textarea
            value={t.text}
            onChange={(e) => updateText(selected!.id, { text: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-[#141416] px-2 py-1.5 text-sm text-stone-100 outline-none focus:border-gold/40"
          />
          <label className="block">
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Font</div>
            <select
              value={t.fontFamily}
              onChange={(e) => updateText(selected!.id, { fontFamily: e.target.value })}
              className="lumina-select w-full"
            >
              {FONT_LIST.map((f) => (
                <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={t.color.startsWith("#") ? t.color : "#f4efe6"}
              onChange={(e) => updateText(selected!.id, { color: e.target.value })}
              className="h-8 w-8 rounded border border-white/10 bg-transparent"
            />
            <Slider
              label="Size"
              value={t.fontSize}
              min={18}
              max={220}
              onChange={(fontSize) => updateText(selected!.id, { fontSize })}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {([400, 500, 600, 700, 800] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => updateText(selected!.id, { fontWeight: w })}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px]",
                  t.fontWeight === w ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
                )}
              >
                {w}
              </button>
            ))}
            <button
              type="button"
              onClick={() => updateText(selected!.id, { italic: !t.italic })}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] italic",
                t.italic ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              Italic
            </button>
            <button
              type="button"
              onClick={() => updateText(selected!.id, { uppercase: !t.uppercase })}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                t.uppercase ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              AA
            </button>
            <button
              type="button"
              onClick={() => updateText(selected!.id, { stroke: !t.stroke })}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                t.stroke ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              Outline
            </button>
            <button
              type="button"
              onClick={() => updateText(selected!.id, { shadow: !t.shadow })}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                t.shadow ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              Shadow
            </button>
            <button
              type="button"
              onClick={() => updateText(selected!.id, { bg: !t.bg })}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                t.bg ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              Box
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">50+ styles</p>
          <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto pr-1">
            {TEXT_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateText(selected!.id, s.patch)}
                className="truncate rounded-md border border-white/10 px-2 py-1 text-left text-[10px] text-stone-300 hover:border-gold/30 hover:text-gold"
                style={{ fontFamily: s.patch.fontFamily }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FrameTab() {
  const { selected, applyFrame, updateLayer, commit } = useEditorContext();
  if (!selected) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] text-stone-500">In-camera mats, film, polaroid, and ornate borders.</p>
      <div className="grid grid-cols-3 gap-1.5">
        {FRAMES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => applyFrame(f.id)}
            className={cn(
              "rounded-lg border p-1.5 text-left",
              selected.frameId === f.id ? "border-gold/50" : "border-white/10 hover:border-white/25",
            )}
          >
            <div className="mb-1 h-8 rounded-sm border" style={{ borderColor: f.swatch, background: "#1a1a1c" }} />
            <span className="text-[9px] text-stone-300">{f.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Tint</span>
        <input
          type="color"
          value={selected.frameColor || "#f4efe6"}
          onChange={(e) => {
            commit();
            updateLayer(selected.id, { frameColor: e.target.value });
          }}
          className="h-7 w-7 rounded border border-white/10 bg-transparent"
        />
      </div>
    </div>
  );
}

function SizeTab() {
  const { applyFormat, formatId, doc } = useEditorContext();
  const current = formatById(formatId);
  return (
    <div className="space-y-4">
      <p className="text-[11px] leading-relaxed text-stone-500">
        Snap the canvas to a platform size. Multiple photos auto-collage into the new frame.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 font-mono text-[11px] text-gold">
        {doc.w} × {doc.h}
        {current ? ` · ${current.ratio} · ${current.name}` : ""}
      </div>
      {FORMAT_GROUPS.map((group) => (
        <div key={group}>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
            {group}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {CANVAS_FORMATS.filter((f) => f.group === group).map((f) => (
              <button
                key={f.id}
                type="button"
                title={f.hint}
                onClick={() => applyFormat(f.id)}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-left",
                  formatId === f.id ? "border-gold/45 bg-gold/10" : "border-white/10 hover:border-gold/25",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-stone-200">{f.name}</span>
                  <span className="font-mono text-[9px] text-gold/80">{f.ratio}</span>
                </div>
                <div className="mt-0.5 font-mono text-[9px] text-stone-600">
                  {f.w}×{f.h}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CollageTab() {
  const { applyCollage, layers, doc, applyFormat, formatId } = useEditorContext();
  const n = layers.filter((l) => l.kind === "image").length;
  const preview = autoCells(Math.max(1, n), doc.w / Math.max(1, doc.h));
  return (
    <div>
      <p className="mb-2 text-[11px] leading-relaxed text-stone-500">
        {n} photo{n === 1 ? "" : "s"} — grid auto-fits the count and the current canvas ratio.
      </p>
      <button
        type="button"
        onClick={() => applyCollage("auto")}
        className="lumina-btn-gold mb-3 w-full justify-center"
      >
        Auto collage · {n || 0} {n === 1 ? "cell" : "cells"}
      </button>
      <div
        className="relative mb-3 w-full overflow-hidden rounded-md border border-gold/20 bg-[#1a1a1c]"
        style={{ aspectRatio: `${doc.w} / ${doc.h}` }}
      >
        {preview.map((cell, i) => (
          <span
            key={i}
            className="absolute rounded-[2px] bg-gold/30"
            style={{
              left: `${cell.x * 100}%`,
              top: `${cell.y * 100}%`,
              width: `${cell.w * 100}%`,
              height: `${cell.h * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {["yt-hd", "yt-strip", "yt-bar", "obs-full", "yt-short", "ig-post"].map((id) => {
          const f = formatById(id);
          if (!f) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => applyFormat(id)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                formatId === id ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
              )}
            >
              {f.ratio}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {COLLAGES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => applyCollage(c.id)}
            className="rounded-lg border border-white/10 p-2 text-left hover:border-gold/30"
          >
            <div
              className="relative mb-1.5 w-full overflow-hidden rounded-sm bg-[#1a1a1c]"
              style={{ aspectRatio: String(c.ratio) }}
            >
              {c.cells.map((cell, i) => (
                <span
                  key={i}
                  className="absolute rounded-[2px] bg-gold/25"
                  style={{
                    left: `${cell.x * 100}%`,
                    top: `${cell.y * 100}%`,
                    width: `${cell.w * 100}%`,
                    height: `${cell.h * 100}%`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-300">{c.name}</span>
            <span className="ml-1 text-[9px] text-stone-600">{c.cells.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MaskTab() {
  const { selected, setTool, setMaskShape, applyResetMask, applyInvertMask, applyFeather, commit } =
    useEditorContext();
  if (!selected) return null;
  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-stone-500">
        Hide and reveal with a brush, or drag a fade / oval / heart matte — same idea as a layer mask.
      </p>
      <Ghost
        onClick={() => {
          setTool("mask");
          setMaskShape("brush");
        }}
      >
        Brush mask
      </Ghost>
      <div className="grid grid-cols-2 gap-1">
        <Ghost
          onClick={() => {
            setTool("mask");
            setMaskShape("gradient");
          }}
        >
          Gradient
        </Ghost>
        <Ghost
          onClick={() => {
            setTool("mask");
            setMaskShape("ellipse");
          }}
        >
          Oval
        </Ghost>
        <Ghost
          onClick={() => {
            setTool("mask");
            setMaskShape("rect");
          }}
        >
          Rectangle
        </Ghost>
        <Ghost
          onClick={() => {
            setTool("mask");
            setMaskShape("heart");
          }}
        >
          Heart
        </Ghost>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Ghost onClick={applyResetMask}>Reset</Ghost>
        <Ghost onClick={applyInvertMask}>Invert</Ghost>
        <Ghost
          onClick={() => {
            commit();
            applyFeather(3);
          }}
        >
          Feather
        </Ghost>
      </div>
    </div>
  );
}

function Ghost({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button type="button" title={title} onClick={onClick} className="lumina-btn flex-1 justify-center text-[10px]">
      {children}
    </button>
  );
}

function PaperControls({
  paper,
  setPaper,
}: {
  paper: { mode: "transparent" | "color"; color: string };
  setPaper: (p: { mode: "transparent" | "color"; color: string }) => void;
}) {
  const swatches = ["#0c0c0e", "#f4efe6", "#111827", "#7c2d12", "#1e3a5f"];
  return (
    <div className="mt-5">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
        Canvas paper
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setPaper({ ...paper, mode: "transparent" })}
          className={cn(
            "h-7 rounded-md border px-2 text-[10px]",
            paper.mode === "transparent" ? "border-gold/40 text-gold" : "border-white/10 text-stone-400",
          )}
        >
          Transparent
        </button>
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setPaper({ mode: "color", color: c })}
            className={cn(
              "h-7 w-7 rounded-md border",
              paper.mode === "color" && paper.color === c ? "border-gold" : "border-white/10",
            )}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}
