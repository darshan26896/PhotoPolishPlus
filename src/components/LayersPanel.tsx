import { useMemo, useState } from "react";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import { useEditorContext } from "../editor/EditorContext";
import { getSprite } from "../lib/render";
import { BLEND_MODES } from "../lib/blend";
import { cn } from "../utils/cn";
import type { Layer } from "../types";

export function LayersPanel() {
  const {
    layers,
    selectedId,
    setSelectedId,
    toggleVisible,
    toggleLock,
    deleteLayer,
    duplicateLayer,
    reorder,
    moveLayer,
    setOpacity,
    setBlend,
    commit,
    fileRef,
  } = useEditorContext();

  const [dragId, setDragId] = useState<string | null>(null);
  const visual = [...layers].reverse();

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
          Layers
        </h2>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[10px] uppercase tracking-[0.14em] text-gold/80 hover:text-gold"
        >
          + Overlay
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {visual.length === 0 && (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-stone-600">
            Each photograph becomes a layer. Stack, fade, and blend them here.
          </p>
        )}
        {visual.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            active={layer.id === selectedId}
            onSelect={() => setSelectedId(layer.id)}
            onVisible={() => toggleVisible(layer.id)}
            onLock={() => toggleLock(layer.id)}
            onDelete={() => deleteLayer(layer.id)}
            onDuplicate={() => duplicateLayer(layer.id)}
            onUp={() => moveLayer(layer.id, "up")}
            onDown={() => moveLayer(layer.id, "down")}
            onOpacity={(v) => setOpacity(layer.id, v)}
            onBlend={(v) => {
              commit();
              setBlend(layer.id, v as Layer["blendMode"]);
            }}
            onDragStart={() => setDragId(layer.id)}
            onDrop={() => {
              if (dragId) reorder(dragId, layer.id);
              setDragId(null);
            }}
            dim={dragId === layer.id}
            onBegin={commit}
          />
        ))}
      </div>
    </section>
  );
}

function LayerRow({
  layer,
  active,
  onSelect,
  onVisible,
  onLock,
  onDelete,
  onDuplicate,
  onUp,
  onDown,
  onOpacity,
  onBlend,
  onDragStart,
  onDrop,
  dim,
  onBegin,
}: {
  layer: Layer;
  active: boolean;
  onSelect: () => void;
  onVisible: () => void;
  onLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUp: () => void;
  onDown: () => void;
  onOpacity: (v: number) => void;
  onBlend: (v: string) => void;
  onDragStart: () => void;
  onDrop: () => void;
  dim: boolean;
  onBegin: () => void;
}) {
  const thumb = useMemo(() => {
    try {
      return getSprite(layer).toDataURL("image/jpeg", 0.5);
    } catch {
      return "";
    }
  }, [layer]);

  const blendLabel = BLEND_MODES.find((b) => b.id === layer.blendMode)?.label ?? "Normal";

  return (
    <div
      draggable
      onDragStart={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "SELECT" || tag === "BUTTON") {
          e.preventDefault();
          return;
        }
        onDragStart();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-xl border p-2 transition",
        active
          ? "border-gold/35 bg-gold/10"
          : "border-transparent bg-white/[0.03] hover:bg-white/[0.05]",
        dim && "opacity-40",
        !layer.visible && "opacity-50",
      )}
    >
      <div className="flex gap-2">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-checker-sm">
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-stone-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="truncate text-[12px] font-medium text-stone-200">
              {layer.kind === "text" ? "Aa · " : layer.kind === "draw" ? "✎ · " : ""}
              {layer.name}
            </p>
            <div className="flex items-center gap-0.5">
              <Mini onClick={onVisible} title="Visibility">
                {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Mini>
              <Mini onClick={onLock} title="Lock">
                {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Mini>
            </div>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-stone-500">
            {blendLabel} · {layer.opacity}% visible
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={layer.opacity}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              onBegin();
            }}
            onChange={(e) => onOpacity(Number(e.target.value))}
            className="lumina-range mt-1 w-full"
            title="Visibility"
          />
        </div>
      </div>

      {active && (
        <div
          className="mt-2 flex items-center gap-1 border-t border-white/10 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={layer.blendMode}
            onChange={(e) => onBlend(e.target.value)}
            className="lumina-select min-w-0 flex-1"
          >
            {BLEND_MODES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <Mini onClick={onUp} title="Bring forward">
            <ChevronUp className="h-3.5 w-3.5" />
          </Mini>
          <Mini onClick={onDown} title="Send backward">
            <ChevronDown className="h-3.5 w-3.5" />
          </Mini>
          <Mini onClick={onDuplicate} title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </Mini>
          <Mini onClick={onDelete} title="Delete" danger>
            <Trash2 className="h-3.5 w-3.5" />
          </Mini>
        </div>
      )}
    </div>
  );
}

function Mini({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md text-stone-400 hover:bg-white/10 hover:text-stone-100",
        danger && "hover:bg-rose-500/15 hover:text-rose-300",
      )}
    >
      {children}
    </button>
  );
}
