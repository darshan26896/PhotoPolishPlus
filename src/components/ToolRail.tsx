import {
  Eraser,
  Hand,
  MousePointer2,
  Paintbrush,
  Palette,
  PenLine,
  SlidersHorizontal,
  Sparkles,
  Stamp,
  Type,
  WandSparkles,
  SquareDashed,
  Sparkle,
} from "lucide-react";
import { useEditorContext } from "../editor/EditorContext";
import type { Tool } from "../types";
import { cn } from "../utils/cn";

const TOOLS: { id: Tool; label: string; k: string; icon: typeof Eraser }[] = [
  { id: "move", label: "Move", k: "V", icon: MousePointer2 },
  { id: "erase", label: "Erase", k: "E", icon: Eraser },
  { id: "restore", label: "Reveal", k: "R", icon: Paintbrush },
  { id: "wand", label: "Wand", k: "W", icon: WandSparkles },
  { id: "mask", label: "Mask", k: "M", icon: SquareDashed },
  { id: "clone", label: "Clone", k: "C", icon: Stamp },
  { id: "heal", label: "AI Erase", k: "A", icon: Sparkle },
  { id: "draw", label: "Draw", k: "D", icon: PenLine },
  { id: "text", label: "Type", k: "T", icon: Type },
  { id: "pan", label: "Pan", k: "H", icon: Hand },
];

export function ToolRail() {
  const {
    tool,
    setTool,
    applyAutoRemove,
    aiBusy,
    selected,
    setEditTab,
    editTab,
    addTextLayer,
    addDrawLayer,
  } = useEditorContext();

  return (
    <aside className="relative z-20 flex w-[68px] shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r border-white/10 bg-[#0c0c0e] py-2">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const active = tool === t.id;
        return (
          <button
            key={t.id}
            type="button"
            title={`${t.label} (${t.k})`}
            onClick={() => {
              setTool(t.id);
              if (t.id === "text") {
                setEditTab("type");
                if (!selected || selected.kind !== "text") addTextLayer();
              }
              if (t.id === "draw") {
                addDrawLayer();
              }
              if (t.id === "mask") setEditTab("mask");
              if (t.id === "clone") {
                /* dock */
              }
            }}
            className={cn(
              "group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl transition",
              active
                ? "bg-gold/15 text-gold shadow-[inset_0_0_0_1px_rgba(212,180,131,0.35)]"
                : "text-stone-400 hover:bg-white/5 hover:text-stone-100",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
            <span className="pointer-events-none absolute left-full z-40 ml-3 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#161616] px-2 py-1 text-[11px] text-stone-200 shadow-xl group-hover:block">
              {t.label}
              <span className="ml-2 font-mono text-stone-500">{t.k}</span>
            </span>
          </button>
        );
      })}

      <div className="my-1.5 h-px w-8 bg-white/10" />

      <button
        type="button"
        title="Looks"
        onClick={() => setEditTab("looks")}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition",
          editTab === "looks" ? "bg-gold/15 text-gold" : "text-stone-400 hover:bg-white/5 hover:text-stone-100",
        )}
      >
        <Palette className="h-4 w-4" strokeWidth={1.7} />
      </button>
      <button
        type="button"
        title="Tone & color"
        onClick={() => setEditTab("tone")}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition",
          editTab === "tone" || editTab === "color" || editTab === "fx"
            ? "bg-gold/15 text-gold"
            : "text-stone-400 hover:bg-white/5 hover:text-stone-100",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.7} />
      </button>

      <div className="my-1.5 h-px w-8 bg-white/10" />

      <button
        type="button"
        title="Auto remove background"
        disabled={!selected || aiBusy}
        onClick={applyAutoRemove}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition",
          "bg-gradient-to-br from-amber-200/20 to-orange-500/10 text-gold",
          "shadow-[inset_0_0_0_1px_rgba(212,180,131,0.28)]",
          "hover:from-amber-200/30 disabled:opacity-30",
        )}
      >
        <Sparkles className={cn("h-4 w-4", aiBusy && "animate-pulse")} />
      </button>
    </aside>
  );
}
