import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { docToLayerLocal, docToScreen, layerLocalToDoc, pointInLayer, screenToDoc } from "../lib/geometry";
import { composite, drawSelection, hitHandle, type HandleId } from "../lib/render";
import { strokeBrush } from "../lib/brush";
import {
  applyEllipseMask,
  applyGradientMask,
  applyHeartMask,
  applyRectMask,
  cloneStamp,
  strokeDraw,
} from "../lib/draw";
import { ensureBitmap } from "../lib/image";
import { formatById } from "../lib/formats";
import { aiErase } from "../lib/inpaint";
import { EmptyState } from "./EmptyState";
import { BrushDock } from "./BrushDock";
import type { Layer, Point } from "../types";
import { cn } from "../utils/cn";

interface Drag {
  kind: "pan" | "move" | "scale" | "rotate" | "brush" | "draw" | "clone" | "maskshape" | "heal";
  startScreen: Point;
  startPan: Point;
  lastLocal: Point;
  origin: { x: number; y: number; scale: number; scaleX?: number; scaleY?: number; rotation: number };
  startDoc: Point;
  handle?: HandleId;
  layerId?: string;
  cloneOffset?: Point;
  srcLayerId?: string;
}

export function CanvasStage() {
  const ed = useEditorContext();
  const {
    layers,
    selected,
    setSelectedId,
    tool,
    zoom,
    setZoom,
    pan,
    setPan,
    doc,
    paper,
    tick,
    viewportRef,
    addFiles,
    spaceDown,
    brush,
    commit,
    layersRef,
    applyWand,
    bump,
    draw,
    cloneSource,
    setCloneSource,
    maskShape,
    addTextLayer,
    addDrawLayer,
    flash,
  } = ed;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [over, setOver] = useState(false);
  const [cloneMarks, setCloneMarks] = useState<{ inn: Point; out: Point } | null>(null);
  const healMark = useRef<HTMLCanvasElement | null>(null);
  const drag = useRef<Drag | null>(null);

  const clientFromLocal = (layer: Layer, lx: number, ly: number) => {
    const vp = viewportRef.current?.getBoundingClientRect();
    if (!vp) return { x: 0, y: 0 };
    const docP = layerLocalToDoc(lx, ly, layer);
    const s = docToScreen(docP.x, docP.y, pan, zoom);
    return { x: vp.left + s.x, y: vp.top + s.y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== doc.w) canvas.width = doc.w;
    if (canvas.height !== doc.h) canvas.height = doc.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    composite(ctx, layers, doc, paper, ed.bypass);
    if (selected && selected.visible && tool === "move") {
      drawSelection(ctx, selected, zoom);
    }
  }, [layers, doc, paper, tick, selected, tool, zoom, ed.bypass]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0014);
      setZoom((z) => {
        const nz = Math.max(0.06, Math.min(4.5, z * factor));
        setPan((p) => ({
          x: sx - ((sx - p.x) / z) * nz,
          y: sy - ((sy - p.y) / z) * nz,
        }));
        return nz;
      });
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [setPan, setZoom, viewportRef]);

  const pointerPos = (e: React.PointerEvent) => {
    const vp = viewportRef.current!;
    const rect = vp.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return { sx, sy, docPt: screenToDoc(sx, sy, pan, zoom) };
  };

  const hitTop = (docPt: Point): Layer | null => {
    const list = layersRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const l = list[i];
      if (!l.visible) continue;
      if (pointInLayer(docPt.x, docPt.y, l)) return l;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!layers.length) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const { sx, sy, docPt } = pointerPos(e);
    const panTool = tool === "pan" || spaceDown || e.button === 1;
    if (panTool) {
      drag.current = {
        kind: "pan",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: docPt,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
      };
      return;
    }

    if (tool === "move") {
      if (selected && !selected.locked) {
        const handle = hitHandle(selected, docPt, zoom);
        if (handle && handle !== "body") {
          commit();
          drag.current = {
            kind: handle === "rot" ? "rotate" : "scale",
            startScreen: { x: sx, y: sy },
            startPan: { ...pan },
            lastLocal: docPt,
            origin: {
              x: selected.x,
              y: selected.y,
              scale: selected.scale,
              scaleX: selected.scaleX ?? 1,
              scaleY: selected.scaleY ?? 1,
              rotation: selected.rotation,
            },
            startDoc: docPt,
            handle,
            layerId: selected.id,
          };
          return;
        }
      }
      const hit = hitTop(docPt);
      setSelectedId(hit ? hit.id : null);
      if (hit && !hit.locked) {
        commit();
        drag.current = {
          kind: "move",
          startScreen: { x: sx, y: sy },
          startPan: { ...pan },
          lastLocal: docPt,
          origin: { x: hit.x, y: hit.y, scale: hit.scale, scaleX: hit.scaleX ?? 1, scaleY: hit.scaleY ?? 1, rotation: hit.rotation },
          startDoc: docPt,
          layerId: hit.id,
        };
      }
      return;
    }

    const target = selected ?? hitTop(docPt);
    if (target) setSelectedId(target.id);
    const layer = target;
    if (!layer || layer.locked) return;

    if (tool === "wand") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      applyWand(local.x, local.y, e.altKey);
      return;
    }

    if (tool === "erase" || tool === "restore") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      commit();
      const erase = tool === "erase" ? !e.altKey : e.altKey;
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      strokeBrush(
        layer.mask,
        local.x,
        local.y,
        local.x,
        local.y,
        size,
        brush.hardness,
        brush.opacity,
        erase,
      );
      layer.spriteDirty = true;
      bump();
      drag.current = {
        kind: "brush",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: local,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
        layerId: layer.id,
      };
      return;
    }

    if (tool === "text") {
      addTextLayer();
      return;
    }

    if (tool === "draw") {
      let dl = selected?.kind === "draw" ? selected : [...layersRef.current].reverse().find((l) => l.kind === "draw");
      if (!dl) {
        addDrawLayer();
        return;
      }
      setSelectedId(dl.id);
      const local = docToLayerLocal(docPt.x, docPt.y, dl);
      commit();
      const erase = draw.mode === "eraser";
      const size = draw.size / (zoom * Math.max(0.05, Math.abs(dl.scale)));
      strokeDraw(
        ensureBitmap(dl),
        local.x,
        local.y,
        local.x,
        local.y,
        size,
        draw.color,
        draw.mode === "pencil" ? draw.opacity * 0.45 : draw.opacity,
        draw.mode === "marker" ? 0.2 : draw.hardness,
        erase,
        draw.mode === "highlighter",
      );
      dl.spriteDirty = true;
      bump();
      drag.current = {
        kind: "draw",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: local,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
        layerId: dl.id,
      };
      return;
    }

    if (tool === "heal") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      commit();
      const mark = document.createElement("canvas");
      mark.width = layer.width;
      mark.height = layer.height;
      healMark.current = mark;
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      strokeBrush(mark, local.x, local.y, local.x, local.y, size, 0.35, 0.95, false);
      bump();
      drag.current = {
        kind: "heal",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: local,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
        layerId: layer.id,
      };
      return;
    }

    if (tool === "clone") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      if (e.altKey || !cloneSource) {
        setCloneSource({ layerId: layer.id, x: local.x, y: local.y });
        flash("Source marked — paint where you want the copy");
        return;
      }
      commit();
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      const srcLayer = layersRef.current.find((l) => l.id === cloneSource.layerId) ?? layer;
      const offset = { x: local.x - cloneSource.x, y: local.y - cloneSource.y };
      cloneStamp(layer, srcLayer, local.x, local.y, cloneSource.x, cloneSource.y, size, brush.hardness, brush.opacity);
      layer.spriteDirty = true;
      bump();
      drag.current = {
        kind: "clone",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: local,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
        layerId: layer.id,
        cloneOffset: offset,
        srcLayerId: srcLayer.id,
      };
      return;
    }

    if (tool === "mask") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      if (maskShape === "brush") {
        commit();
        const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
        strokeBrush(layer.mask, local.x, local.y, local.x, local.y, size, brush.hardness, brush.opacity, !e.altKey);
        layer.spriteDirty = true;
        bump();
        drag.current = {
          kind: "brush",
          startScreen: { x: sx, y: sy },
          startPan: { ...pan },
          lastLocal: local,
          origin: { x: 0, y: 0, scale: 1, rotation: 0 },
          startDoc: docPt,
          layerId: layer.id,
        };
        return;
      }
      commit();
      drag.current = {
        kind: "maskshape",
        startScreen: { x: sx, y: sy },
        startPan: { ...pan },
        lastLocal: local,
        origin: { x: 0, y: 0, scale: 1, rotation: 0 },
        startDoc: docPt,
        layerId: layer.id,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { sx, sy, docPt } = pointerPos(e);
    setCursor({ x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (!d) return;

    if (d.kind === "pan") {
      setPan({
        x: d.startPan.x + (sx - d.startScreen.x),
        y: d.startPan.y + (sy - d.startScreen.y),
      });
      return;
    }

    const layer = layersRef.current.find((l) => l.id === d.layerId);
    if (!layer) return;

    if (d.kind === "move") {
      layer.x = d.origin.x + (docPt.x - d.startDoc.x);
      layer.y = d.origin.y + (docPt.y - d.startDoc.y);
      bump();
      return;
    }

    if (d.kind === "scale") {
      const handle = d.handle;
      const ox = d.origin.scaleX ?? 1;
      const oy = d.origin.scaleY ?? 1;
      if (handle === "e" || handle === "w") {
        const startDx = d.startDoc.x - d.origin.x || 1;
        const factor = (docPt.x - d.origin.x) / startDx;
        layer.scaleX = Math.max(0.03, Math.min(8, Math.abs(ox * factor)));
      } else if (handle === "n" || handle === "s") {
        const startDy = d.startDoc.y - d.origin.y || 1;
        const factor = (docPt.y - d.origin.y) / startDy;
        layer.scaleY = Math.max(0.03, Math.min(8, Math.abs(oy * factor)));
      } else {
        const a = Math.hypot(d.startDoc.x - d.origin.x, d.startDoc.y - d.origin.y) || 1;
        const b = Math.hypot(docPt.x - d.origin.x, docPt.y - d.origin.y);
        const sign = layer.scale < 0 ? -1 : 1;
        layer.scale = sign * Math.max(0.03, Math.min(8, Math.abs(d.origin.scale) * (b / a)));
      }
      bump();
      return;
    }

    if (d.kind === "rotate") {
      const a0 = Math.atan2(d.startDoc.y - d.origin.y, d.startDoc.x - d.origin.x);
      const a1 = Math.atan2(docPt.y - d.origin.y, docPt.x - d.origin.x);
      layer.rotation = d.origin.rotation + ((a1 - a0) * 180) / Math.PI;
      bump();
      return;
    }

    if (d.kind === "brush") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      const erase = tool === "restore" ? e.altKey : !e.altKey;
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      strokeBrush(
        layer.mask,
        d.lastLocal.x,
        d.lastLocal.y,
        local.x,
        local.y,
        size,
        brush.hardness,
        brush.opacity,
        erase,
      );
      d.lastLocal = local;
      layer.spriteDirty = true;
      bump();
    }

    if (d.kind === "draw") {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      const size = draw.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      strokeDraw(
        ensureBitmap(layer),
        d.lastLocal.x,
        d.lastLocal.y,
        local.x,
        local.y,
        size,
        draw.color,
        draw.mode === "pencil" ? draw.opacity * 0.45 : draw.opacity,
        draw.mode === "marker" ? 0.2 : draw.hardness,
        draw.mode === "eraser",
        draw.mode === "highlighter",
      );
      d.lastLocal = local;
      layer.spriteDirty = true;
      bump();
    }

    if (d.kind === "clone" && d.cloneOffset && d.srcLayerId) {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      const srcLayer = layersRef.current.find((l) => l.id === d.srcLayerId) ?? layer;
      cloneStamp(
        layer,
        srcLayer,
        local.x,
        local.y,
        local.x - d.cloneOffset.x,
        local.y - d.cloneOffset.y,
        size,
        brush.hardness,
        brush.opacity,
      );
      d.lastLocal = local;
      layer.spriteDirty = true;
      bump();
    }

    if (d.kind === "maskshape") {
      d.lastLocal = docToLayerLocal(docPt.x, docPt.y, layer);
    }

    if (d.kind === "heal" && healMark.current) {
      const local = docToLayerLocal(docPt.x, docPt.y, layer);
      const size = brush.size / (zoom * Math.max(0.05, Math.abs(layer.scale)));
      strokeBrush(healMark.current, d.lastLocal.x, d.lastLocal.y, local.x, local.y, size, 0.35, 0.95, false);
      d.lastLocal = local;
      bump();
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (d?.kind === "move" || d?.kind === "scale" || d?.kind === "rotate") {
      const layer = layersRef.current.find((l) => l.id === d.layerId);
      if (layer) {
        ed.updateLayer(layer.id, {
          x: layer.x,
          y: layer.y,
          scale: layer.scale,
          scaleX: layer.scaleX,
          scaleY: layer.scaleY,
          rotation: layer.rotation,
        });
      }
    }
    if (d?.kind === "maskshape" && d.layerId) {
      const layer = layersRef.current.find((l) => l.id === d.layerId);
      if (layer) {
        const start = docToLayerLocal(d.startDoc.x, d.startDoc.y, layer);
        const end = d.lastLocal;
        if (maskShape === "gradient") applyGradientMask(layer.mask, start.x, start.y, end.x, end.y);
        else if (maskShape === "rect") applyRectMask(layer.mask, start.x, start.y, end.x, end.y);
        else if (maskShape === "heart") applyHeartMask(layer.mask, start.x, start.y, end.x, end.y);
        else applyEllipseMask(layer.mask, start.x, start.y, end.x, end.y);
        layer.spriteDirty = true;
        bump();
      }
    }
    if (d?.kind === "heal" && d.layerId && healMark.current) {
      const layer = layersRef.current.find((l) => l.id === d.layerId);
      if (layer) {
        aiErase(layer, healMark.current);
        layer.spriteDirty = true;
        bump();
        flash("AI erase filled the area");
      }
      healMark.current = null;
    }
    drag.current = null;
  };

  const updateCloneMarks = (e: React.PointerEvent, docPt: Point) => {
    if (tool !== "clone") {
      if (cloneMarks) setCloneMarks(null);
      return;
    }
    const out = { x: e.clientX, y: e.clientY };
    if (!cloneSource) {
      setCloneMarks({ inn: out, out });
      return;
    }
    const srcLayer = layersRef.current.find((l) => l.id === cloneSource.layerId);
    if (!srcLayer) {
      setCloneMarks({ inn: out, out });
      return;
    }
    let sx = cloneSource.x;
    let sy = cloneSource.y;
    const dg = drag.current;
    if (dg?.kind === "clone" && dg.cloneOffset && dg.layerId) {
      const dest = layersRef.current.find((l) => l.id === dg.layerId) ?? srcLayer;
      const local = docToLayerLocal(docPt.x, docPt.y, dest);
      sx = local.x - dg.cloneOffset.x;
      sy = local.y - dg.cloneOffset.y;
    }
    setCloneMarks({ inn: clientFromLocal(srcLayer, sx, sy), out });
  };

  const brushCursor =
    (tool === "erase" ||
      tool === "restore" ||
      tool === "draw" ||
      tool === "heal" ||
      (tool === "mask" && maskShape === "brush")) &&
    over &&
    cursor;

  return (
    <div className="relative min-h-0 min-w-0 flex-1">
      <div
        ref={viewportRef}
        className={cn(
          "absolute inset-0 touch-none overflow-hidden bg-[#080808]",
          tool === "pan" || spaceDown ? "cursor-grab" : "",
          tool === "erase" ||
          tool === "restore" ||
          tool === "clone" ||
          tool === "draw" ||
          tool === "mask" ||
          tool === "heal"
            ? "cursor-none"
            : "",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          const { docPt } = pointerPos(e);
          updateCloneMarks(e, docPt);
          onPointerMove(e);
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={() => setOver(true)}
        onPointerLeave={() => {
          setOver(false);
          setCursor(null);
          setCloneMarks(null);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        {!layers.length ? (
          <EmptyState />
        ) : (
          <div
            className="origin-top-left will-change-transform"
            style={{
              width: doc.w,
              height: doc.h,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <div className="bg-checker absolute inset-0" />
            <canvas
              ref={canvasRef}
              className="relative block"
              style={{ width: doc.w, height: doc.h }}
            />
            {formatById(ed.formatId)?.safe && (
              <div
                className="pointer-events-none absolute border border-dashed border-gold/55"
                style={{
                  left: formatById(ed.formatId)!.safe!.x * doc.w,
                  top: formatById(ed.formatId)!.safe!.y * doc.h,
                  width: formatById(ed.formatId)!.safe!.w * doc.w,
                  height: formatById(ed.formatId)!.safe!.h * doc.h,
                }}
              >
                <span className="absolute left-1 top-1 font-mono text-[10px] uppercase tracking-wider text-gold/80">
                  Safe
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <BrushDock />
      {brushCursor && (
        <div
          className="pointer-events-none fixed z-50 rounded-full"
          style={{
            left: cursor.x,
            top: cursor.y,
            width: tool === "draw" ? draw.size : brush.size,
            height: tool === "draw" ? draw.size : brush.size,
            transform: "translate(-50%, -50%)",
            border: tool === "heal" ? "1.5px solid #c4b5fd" : tool === "erase" ? "1.5px solid #fff" : "1.5px solid #f0d9a8",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
            background: tool === "heal" ? "rgba(167,139,250,0.15)" : undefined,
          }}
        />
      )}
      {tool === "clone" && cloneMarks && (
        <>
          <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full">
            <line
              x1={cloneMarks.inn.x}
              y1={cloneMarks.inn.y}
              x2={cloneMarks.out.x}
              y2={cloneMarks.out.y}
              stroke="rgba(240,217,168,0.55)"
              strokeWidth="1.25"
              strokeDasharray="5 5"
            />
          </svg>
          <div
            className="clone-mark clone-mark-in"
            style={{
              left: cloneMarks.inn.x,
              top: cloneMarks.inn.y,
              width: brush.size,
              height: brush.size,
            }}
          >
            In
          </div>
          <div
            className="clone-mark clone-mark-out"
            style={{
              left: cloneMarks.out.x,
              top: cloneMarks.out.y,
              width: brush.size,
              height: brush.size,
            }}
          >
            Out
          </div>
        </>
      )}
      {ed.aiBusy && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-gold/30 bg-[#121212]/90 px-8 py-6 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="font-serif text-lg text-gold">{ed.aiStage || "Cutting…"}</p>
          </div>
        </div>
      )}
      {ed.busy && !ed.aiBusy && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
          <p className="font-serif text-xl text-stone-200">{ed.busy}</p>
        </div>
      )}
      {ed.bypass && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-serif text-sm text-stone-100">
          Original
        </div>
      )}
    </div>
  );
}
       