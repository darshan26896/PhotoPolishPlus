import { Download, FolderOpen, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useEditorContext } from "../editor/EditorContext";
import { logoUrl } from "../brand";

export function TopBar() {
  const {
    fileRef,
    exportPng,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    fitToView,
    doc,
    layers,
    formatId,
    setEditTab,
  } = useEditorContext();

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0c0c0e]/90 px-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-1">
          <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
          <div className="leading-none">
            <div className="font-serif text-[17px] tracking-wide text-stone-100">
              PhotoPolish<span className="text-gold">Plus</span>
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-gold/70">
              Studio
            </div>
          </div>
        </div>
        <div className="mx-2 h-6 w-px bg-white/10" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="lumina-btn"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Add photos
        </button>
        <button type="button" onClick={exportPng} className="lumina-btn-gold" disabled={!layers.length}>
          <Download className="h-3.5 w-3.5" />
          Export PNG
        </button>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => setEditTab("size")}
          className="rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-stone-400 hover:bg-white/5 hover:text-gold"
          title="Canvas format"
        >
          {doc.w} × {doc.h}
          <span className="ml-1.5 uppercase tracking-wider text-gold/70">{formatId.replace("yt-", "").replace("obs-", "")}</span>
        </button>
        <span className="text-stone-700">/</span>
        <span className="font-mono text-[10px] text-stone-500">{layers.length} layers</span>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn title="Undo" onClick={undo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Redo" onClick={redo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </IconBtn>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <IconBtn title="Zoom out" onClick={() => setZoom((z) => Math.max(0.08, z / 1.15))}>
          <ZoomOut className="h-4 w-4" />
        </IconBtn>
        <button
          type="button"
          onClick={fitToView}
          className="min-w-[3.4rem] rounded-md px-1 py-1 font-mono text-[11px] tabular-nums text-stone-300 hover:bg-white/5"
          title="Fit (0)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <IconBtn title="Zoom in" onClick={() => setZoom((z) => Math.min(4, z * 1.15))}>
          <ZoomIn className="h-4 w-4" />
        </IconBtn>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition hover:bg-white/5 hover:text-stone-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
