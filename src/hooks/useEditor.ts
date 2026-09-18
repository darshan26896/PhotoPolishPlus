import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Adjustments,
  BlendMode,
  BrushSettings,
  DocBackground,
  EditTab,
  Layer,
  LayerLook,
  Point,
  Size,
  Tool,
} from "../types";
import { cloneCanvas, createLayer, loadFromFile, loadImage, maybeDownscale } from "../lib/image";
import {
  featherMask,
  invertMask,
  magicWandErase,
  replaceMask,
  resetMask,
  smartRemoveBackground,
} from "../lib/backgroundRemoval";
import { composite } from "../lib/render";
import { SAMPLE_URLS, type SampleId } from "../lib/samples";
import { computeAuto, defaultAdjust, defaultLook } from "../lib/adjust";
import { COLLAGES, autoCells } from "../lib/collage";
import { formatById } from "../lib/formats";
import { clipLayerToRect } from "../lib/draw";
import { createDrawLayer, createTextLayer, makeOpaqueMask } from "../lib/image";
import { defaultText, ensureFont, rasterizeText } from "../lib/text";
import type { CloneSource, DrawSettings, MaskShape, TextProps } from "../types";

interface Snap {
  layers: Layer[];
  selectedId: string | null;
  doc: Size;
}

function cloneState(layers: Layer[], selectedId: string | null, doc: Size): Snap {
  return {
    selectedId,
    doc: { ...doc },
    layers: layers.map((l) => ({
      ...l,
      mask: cloneCanvas(l.mask),
      bitmap: cloneCanvas(l.bitmap),
      sprite: null,
      spriteDirty: true,
      adjust: { ...l.adjust },
      look: { ...l.look },
      text: l.text ? { ...l.text } : undefined,
    })),
  };
}

export function useEditor() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("move");
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState<Point>({ x: 64, y: 64 });
  const [doc, setDoc] = useState<Size>({ w: 1600, h: 1000 });
  const [brush, setBrush] = useState<BrushSettings>({ size: 64, hardness: 0.42, opacity: 0.92 });
  const [wandTolerance, setWandTolerance] = useState(28);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStage, setAiStage] = useState("");
  const [aiThreshold, setAiThreshold] = useState(0.34);
  const [aiFeather, setAiFeather] = useState(1.6);
  const [paper, setPaper] = useState<DocBackground>({ mode: "transparent", color: "#0c0c0e" });
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [bypass, setBypass] = useState(false);
  const [editTab, setEditTab] = useState<EditTab>("looks");
  const [draw, setDraw] = useState<DrawSettings>({
    mode: "pen",
    color: "#f0d9a8",
    size: 18,
    opacity: 0.92,
    hardness: 0.85,
  });
  const [cloneSource, setCloneSource] = useState<CloneSource | null>(null);
  const [maskShape, setMaskShape] = useState<MaskShape>("brush");
  const [showMask, setShowMask] = useState(false);
  const [formatId, setFormatId] = useState("yt-hd");

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const layersRef = useRef(layers);
  const selectedIdRef = useRef(selectedId);
  const docRef = useRef(doc);
  const toolRef = useRef(tool);
  const pastRef = useRef<Snap[]>([]);
  const futureRef = useRef<Snap[]>([]);
  const toastTimer = useRef<number>(0);

  layersRef.current = layers;
  selectedIdRef.current = selectedId;
  docRef.current = doc;
  toolRef.current = tool;

  const selected = useMemo(
    () => layers.find((l) => l.id === selectedId) ?? null,
    [layers, selectedId],
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const bump = useCallback(() => setTick((t) => t + 1), []);

  const commit = useCallback(() => {
    pastRef.current.push(cloneState(layersRef.current, selectedIdRef.current, docRef.current));
    if (pastRef.current.length > 24) pastRef.current.shift();
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const restore = useCallback((snap: Snap) => {
    setLayers(snap.layers);
    setSelectedId(snap.selectedId);
    setDoc(snap.doc);
    bump();
  }, [bump]);

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(cloneState(layersRef.current, selectedIdRef.current, docRef.current));
    restore(prev);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [restore]);

  const redo = useCallback(() => {
    const nxt = futureRef.current.pop();
    if (!nxt) return;
    pastRef.current.push(cloneState(layersRef.current, selectedIdRef.current, docRef.current));
    restore(nxt);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [restore]);

  const fitToView = useCallback(() => {
    const vp = viewportRef.current;
    const d = docRef.current;
    if (!vp || d.w < 1 || d.h < 1) return;
    const pad = 64;
    const zx = (vp.clientWidth - pad * 2) / d.w;
    const zy = (vp.clientHeight - pad * 2) / d.h;
    const z = Math.max(0.05, Math.min(3.5, Math.min(zx, zy)));
    setZoom(z);
    setPan({
      x: (vp.clientWidth - d.w * z) / 2,
      y: (vp.clientHeight - d.h * z) / 2,
    });
  }, []);

  const addLoaded = useCallback(
    (items: { img: HTMLImageElement; name: string }[]) => {
      if (!items.length) return;
      commit();
      const next = [...layersRef.current];
      let dw = docRef.current.w;
      let dh = docRef.current.h;
      let sel = selectedIdRef.current;
      for (const { img, name } of items) {
        if (next.length === 0) {
          dw = img.naturalWidth || img.width;
          dh = img.naturalHeight || img.height;
          const ly = createLayer(img, name, dw, dh, "base");
          next.push(ly);
          sel = ly.id;
        } else {
          const ly = createLayer(img, name, dw, dh, "overlay");
          next.push(ly);
          sel = ly.id;
        }
      }
      setDoc({ w: dw, h: dh });
      setLayers(next);
      setSelectedId(sel);
      requestAnimationFrame(() => fitToView());
      flash(items.length > 1 ? `${items.length} photos stacked` : "Photo added as a layer");
    },
    [commit, fitToView, flash],
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (!files.length) {
        flash("Please drop image files");
        return;
      }
      setBusy("Reading photographs…");
      try {
        const items = [];
        for (const f of files) {
          const img = await maybeDownscale(await loadFromFile(f));
          items.push({ img, name: f.name });
        }
        addLoaded(items);
      } catch {
        flash("Could not read one of the files");
      } finally {
        setBusy(null);
      }
    },
    [addLoaded, flash],
  );

  const loadSample = useCallback(
    async (id: SampleId) => {
      setBusy("Fetching plates…");
      setAiStage("");
      try {
        if (id === "golden") {
          const [land, port, bokeh] = await Promise.all([
            loadImage(SAMPLE_URLS.landscape).then((i) => maybeDownscale(i, 1800)),
            loadImage(SAMPLE_URLS.portrait).then((i) => maybeDownscale(i, 1600)),
            loadImage(SAMPLE_URLS.bokeh).then((i) => maybeDownscale(i, 1600)),
          ]);
          setBusy("Cutting the figure…");
          const dw = land.naturalWidth || land.width;
          const dh = land.naturalHeight || land.height;
          const base = createLayer(land, "Alpine dusk", dw, dh, "base");
          const subject = createLayer(port, "Figure", dw, dh, "overlay");
          const cut = await smartRemoveBackground(port, { threshold: 0.38, feather: 1.8 });
          replaceMask(subject.mask, cut);
          subject.spriteDirty = true;
          const lights = createLayer(bokeh, "Bokeh leak", dw, dh, "overlay");
          lights.blendMode = "screen";
          lights.opacity = 44;
          lights.scale = Math.max(dw / lights.width, dh / lights.height) * 1.05;
          commit();
          setDoc({ w: dw, h: dh });
          setLayers([base, subject, lights]);
          setSelectedId(subject.id);
        } else if (id === "botanical") {
          const [port, leaves] = await Promise.all([
            loadImage(SAMPLE_URLS.portraitSoft).then((i) => maybeDownscale(i, 1800)),
            loadImage(SAMPLE_URLS.leaves).then((i) => maybeDownscale(i, 1800)),
          ]);
          const dw = port.naturalWidth || port.width;
          const dh = port.naturalHeight || port.height;
          const base = createLayer(port, "Studio portrait", dw, dh, "base");
          const shade = createLayer(leaves, "Palm shadow", dw, dh, "overlay");
          shade.blendMode = "multiply";
          shade.opacity = 52;
          shade.scale = Math.max(dw / shade.width, dh / shade.height) * 1.08;
          commit();
          setDoc({ w: dw, h: dh });
          setLayers([base, shade]);
          setSelectedId(shade.id);
        } else {
          const [forest, figure, smoke] = await Promise.all([
            loadImage(SAMPLE_URLS.forest).then((i) => maybeDownscale(i, 1800)),
            loadImage(SAMPLE_URLS.portrait).then((i) => maybeDownscale(i, 1600)),
            loadImage(SAMPLE_URLS.smoke).then((i) => maybeDownscale(i, 1600)),
          ]);
          setBusy("Lifting the subject…");
          const dw = forest.naturalWidth || forest.width;
          const dh = forest.naturalHeight || forest.height;
          const base = createLayer(forest, "Canopy dusk", dw, dh, "base");
          const subject = createLayer(figure, "Figure", dw, dh, "overlay");
          const cut = await smartRemoveBackground(figure, { threshold: 0.36, feather: 1.7 });
          replaceMask(subject.mask, cut);
          subject.spriteDirty = true;
          subject.blendMode = "soft-light";
          subject.opacity = 88;
          const mist = createLayer(smoke, "Smoke veil", dw, dh, "overlay");
          mist.blendMode = "screen";
          mist.opacity = 40;
          mist.scale = Math.max(dw / mist.width, dh / mist.height) * 1.1;
          commit();
          setDoc({ w: dw, h: dh });
          setLayers([base, subject, mist]);
          setSelectedId(subject.id);
        }
        setTool("move");
        requestAnimationFrame(() => fitToView());
        flash("Sample stack ready — tweak visibility and blend");
      } catch {
        flash("Could not reach the sample photographs");
      } finally {
        setBusy(null);
        setAiStage("");
      }
    },
    [commit, fitToView, flash],
  );

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (
          patch.mask ||
          patch.image ||
          patch.adjust ||
          patch.look ||
          patch.flipX !== undefined ||
          patch.flipY !== undefined ||
          patch.bitmap ||
          patch.text ||
          patch.frameId !== undefined
        ) {
          next.spriteDirty = true;
        }
        return next;
      }),
    );
    bump();
  }, [bump]);

  const mutateSelected = useCallback(
    (fn: (l: Layer) => void) => {
      const id = selectedIdRef.current;
      if (!id) return;
      const l = layersRef.current.find((x) => x.id === id);
      if (!l) return;
      fn(l);
      l.spriteDirty = true;
      bump();
    },
    [bump],
  );

  const setOpacity = useCallback((id: string, opacity: number) => {
    updateLayer(id, { opacity: Math.max(0, Math.min(100, Math.round(opacity))) });
  }, [updateLayer]);

  const setBlend = useCallback((id: string, blendMode: BlendMode) => {
    updateLayer(id, { blendMode });
  }, [updateLayer]);

  const toggleVisible = useCallback((id: string) => {
    commit();
    const l = layersRef.current.find((x) => x.id === id);
    if (!l) return;
    updateLayer(id, { visible: !l.visible });
  }, [commit, updateLayer]);

  const toggleLock = useCallback((id: string) => {
    const l = layersRef.current.find((x) => x.id === id);
    if (!l) return;
    updateLayer(id, { locked: !l.locked });
  }, [updateLayer]);

  const deleteLayer = useCallback(
    (id?: string) => {
      const target = id ?? selectedIdRef.current;
      if (!target) return;
      commit();
      const next = layersRef.current.filter((l) => l.id !== target);
      setLayers(next);
      setSelectedId(next.length ? next[next.length - 1].id : null);
    },
    [commit],
  );

  const duplicateLayer = useCallback(
    (id?: string) => {
      const target = id ?? selectedIdRef.current;
      const l = layersRef.current.find((x) => x.id === target);
      if (!l) return;
      commit();
      const copy: Layer = {
        ...l,
        id: `${l.id}_c${Math.random().toString(36).slice(2, 6)}`,
        name: `${l.name} copy`,
        x: l.x + 24,
        y: l.y + 24,
        mask: cloneCanvas(l.mask),
        bitmap: cloneCanvas(l.bitmap),
        sprite: null,
        spriteDirty: true,
        adjust: { ...l.adjust },
        look: { ...l.look },
        text: l.text ? { ...l.text } : undefined,
      };
      const idx = layersRef.current.findIndex((x) => x.id === l.id);
      const next = [...layersRef.current];
      next.splice(idx + 1, 0, copy);
      setLayers(next);
      setSelectedId(copy.id);
    },
    [commit],
  );

  const reorder = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    commit();
    const vis = [...layersRef.current].reverse();
    const from = vis.findIndex((l) => l.id === fromId);
    const to = vis.findIndex((l) => l.id === toId);
    if (from < 0 || to < 0) return;
    const [item] = vis.splice(from, 1);
    vis.splice(to, 0, item);
    setLayers(vis.reverse());
  }, [commit]);

  const moveLayer = useCallback((id: string, dir: "up" | "down") => {
    commit();
    const arr = [...layersRef.current];
    const i = arr.findIndex((l) => l.id === id);
    if (i < 0) return;
    const j = dir === "up" ? i + 1 : i - 1;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setLayers(arr);
  }, [commit]);

  const applyAutoRemove = useCallback(async () => {
    const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
    if (!l) {
      flash("Select a layer to cut out");
      return;
    }
    if (l.locked) {
      flash("Unlock the layer first");
      return;
    }
    commit();
    setAiBusy(true);
    try {
      setAiStage("Reading color fields…");
      await pause(60);
      setAiStage("Separating subject from ground…");
      const mask = await smartRemoveBackground(l.image, {
        threshold: aiThreshold,
        feather: aiFeather,
      });
      setAiStage("Refining edge and hair…");
      await pause(40);
      replaceMask(l.mask, mask);
      l.spriteDirty = true;
      setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, spriteDirty: true } : x)));
      bump();
      flash("Background lifted — refine with the eraser if needed");
    } catch {
      flash("Cut-out failed on this plate");
    } finally {
      setAiBusy(false);
      setAiStage("");
    }
  }, [aiFeather, aiThreshold, bump, commit, flash]);

  const applyResetMask = useCallback(() => {
    const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
    if (!l || l.locked) return;
    commit();
    resetMask(l.mask);
    l.spriteDirty = true;
    setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, spriteDirty: true } : x)));
    bump();
  }, [bump, commit]);

  const applyInvertMask = useCallback(() => {
    const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
    if (!l || l.locked) return;
    commit();
    invertMask(l.mask);
    l.spriteDirty = true;
    setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, spriteDirty: true } : x)));
    bump();
  }, [bump, commit]);

  const applyFeather = useCallback(
    (px: number) => {
      const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
      if (!l || l.locked) return;
      commit();
      featherMask(l.mask, px);
      l.spriteDirty = true;
      setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, spriteDirty: true } : x)));
      bump();
    },
    [bump, commit],
  );

  const applyWand = useCallback(
    (lx: number, ly: number, restore = false) => {
      const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
      if (!l || l.locked) return;
      commit();
      magicWandErase(l.image, l.mask, lx, ly, wandTolerance, restore);
      l.spriteDirty = true;
      setLayers((prev) => prev.map((x) => (x.id === l.id ? { ...x, spriteDirty: true } : x)));
      bump();
    },
    [bump, commit, wandTolerance],
  );

  const setAdjust = useCallback(
    (id: string, partial: Partial<Adjustments>) => {
      const l = layersRef.current.find((x) => x.id === id);
      if (!l) return;
      updateLayer(id, { adjust: { ...l.adjust, ...partial } });
    },
    [updateLayer],
  );

  const setLook = useCallback(
    (id: string, look: LayerLook) => {
      updateLayer(id, { look });
    },
    [updateLayer],
  );

  const resetAdjust = useCallback(
    (id?: string) => {
      const target = id ?? selectedIdRef.current;
      if (!target) return;
      commit();
      updateLayer(target, { adjust: defaultAdjust(), look: defaultLook() });
    },
    [commit, updateLayer],
  );

  const autoTone = useCallback(
    (id?: string) => {
      const target = id ?? selectedIdRef.current;
      const l = layersRef.current.find((x) => x.id === target);
      if (!l) return;
      commit();
      updateLayer(l.id, { adjust: { ...l.adjust, ...computeAuto(l.image) } });
      flash("Auto tone applied");
    },
    [commit, flash, updateLayer],
  );

  const flipLayer = useCallback(
    (axis: "x" | "y") => {
      const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
      if (!l) return;
      commit();
      if (axis === "x") updateLayer(l.id, { flipX: !l.flipX });
      else updateLayer(l.id, { flipY: !l.flipY });
    },
    [commit, updateLayer],
  );

  const addTextLayer = useCallback(
    async (seed?: Partial<TextProps>) => {
      commit();
      let dw = docRef.current.w;
      let dh = docRef.current.h;
      if (!layersRef.current.length) {
        dw = 1600;
        dh = 1000;
        setDoc({ w: dw, h: dh });
      }
      const props = { ...defaultText("Your text"), ...seed };
      await ensureFont(props.fontFamily, props.fontWeight, props.fontSize);
      const layer = createTextLayer(dw, dh, props);
      setLayers([...layersRef.current, layer]);
      setSelectedId(layer.id);
      setEditTab("type");
      setTool("move");
      requestAnimationFrame(() => fitToView());
      flash("Text layer added");
    },
    [commit, fitToView, flash],
  );

  const updateText = useCallback(
    async (id: string, partial: Partial<TextProps>) => {
      const l = layersRef.current.find((x) => x.id === id);
      if (!l?.text) return;
      const text = { ...l.text, ...partial };
      if (partial.fontFamily) await ensureFont(text.fontFamily, text.fontWeight, text.fontSize);
      const bitmap = rasterizeText(text);
      updateLayer(id, {
        text,
        bitmap,
        mask: makeOpaqueMask(bitmap.width, bitmap.height),
        width: bitmap.width,
        height: bitmap.height,
        name: text.text.split("\n")[0].slice(0, 24) || "Text",
      });
    },
    [updateLayer],
  );

  const addDrawLayer = useCallback(() => {
    commit();
    let dw = docRef.current.w;
    let dh = docRef.current.h;
    if (!layersRef.current.length) {
      dw = 1600;
      dh = 1000;
      setDoc({ w: dw, h: dh });
    }
    const layer = createDrawLayer(dw, dh);
    setLayers([...layersRef.current, layer]);
    setSelectedId(layer.id);
    setTool("draw");
    flash("Sketch layer ready");
  }, [commit, flash]);

  const applyCollage = useCallback(
    (id: string) => {
      const photos = layersRef.current.filter((l) => l.kind === "image");
      if (!photos.length) {
        flash("Add photos first");
        return;
      }
      commit();
      const d = docRef.current;
      const W = d.w;
      const H = d.h;
      const n = photos.length;
      const picked = COLLAGES.find((c) => c.id === id);
      const cells =
        !picked || id === "auto" || picked.cells.length !== n
          ? autoCells(n, W / Math.max(1, H))
          : picked.cells;
      setPaper({ mode: "color", color: "#0c0c0e" });
      photos.forEach((l, i) => {
        const cell = cells[i];
        if (!cell) return;
        const cw = cell.w * W;
        const ch = cell.h * H;
        l.x = (cell.x + cell.w / 2) * W;
        l.y = (cell.y + cell.h / 2) * H;
        l.scale = Math.max(cw / l.width, ch / l.height);
        l.rotation = 0;
        clipLayerToRect(l, cw, ch);
      });
      setLayers([...layersRef.current]);
      requestAnimationFrame(() => fitToView());
      flash(`Collage auto-fit ${n} photo${n === 1 ? "" : "s"}`);
    },
    [commit, fitToView, flash],
  );

  const applyFormat = useCallback(
    (id: string) => {
      const f = formatById(id);
      if (!f) return;
      commit();
      setDoc({ w: f.w, h: f.h });
      setFormatId(f.id);
      const photos = layersRef.current.filter((l) => l.kind === "image");
      if (photos.length === 1) {
        const l = photos[0];
        l.x = f.w / 2;
        l.y = f.h / 2;
        l.scale = Math.max(f.w / l.width, f.h / l.height);
        l.rotation = 0;
        setLayers([...layersRef.current]);
      } else if (photos.length > 1) {
        const cells = autoCells(photos.length, f.w / f.h);
        setPaper({ mode: "color", color: "#0c0c0e" });
        photos.forEach((l, i) => {
          const cell = cells[i];
          if (!cell) return;
          const cw = cell.w * f.w;
          const ch = cell.h * f.h;
          l.x = (cell.x + cell.w / 2) * f.w;
          l.y = (cell.y + cell.h / 2) * f.h;
          l.scale = Math.max(cw / l.width, ch / l.height);
          l.rotation = 0;
          clipLayerToRect(l, cw, ch);
        });
        setLayers([...layersRef.current]);
      }
      requestAnimationFrame(() => fitToView());
      flash(`${f.name} ${f.ratio} · ${f.w}×${f.h}`);
    },
    [commit, fitToView, flash],
  );

  const applyFrame = useCallback(
    (frameId: string, frameColor?: string) => {
      const l = layersRef.current.find((x) => x.id === selectedIdRef.current);
      if (!l) {
        flash("Select a layer");
        return;
      }
      commit();
      updateLayer(l.id, { frameId, frameColor: frameColor ?? l.frameColor });
    },
    [commit, flash, updateLayer],
  );

  const exportPng = useCallback(() => {
    if (!layersRef.current.length) {
      flash("Add a photo first");
      return;
    }
    const d = docRef.current;
    const c = document.createElement("canvas");
    c.width = d.w;
    c.height = d.h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    composite(ctx, layersRef.current, d, paper);
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `photopolishplus.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      flash("Exported PNG");
    }, "image/png");
  }, [flash, paper]);

  const clearAll = useCallback(() => {
    commit();
    setLayers([]);
    setSelectedId(null);
  }, [commit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceDown(true);
      }
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateLayer();
      } else if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportPng();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        deleteLayer();
      } else if (e.key === "v" || e.key === "V") setTool("move");
      else if (e.key === "e" || e.key === "E") setTool("erase");
      else if (e.key === "r" || e.key === "R") setTool("restore");
      else if (e.key === "w" || e.key === "W") setTool("wand");
      else if (e.key === "h" || e.key === "H") setTool("pan");
      else if (e.key === "t" || e.key === "T") {
        setTool("text");
        setEditTab("type");
      } else if (e.key === "d" || e.key === "D") setTool("draw");
      else if (e.key === "c" || e.key === "C") setTool("clone");
      else if (e.key === "a" || e.key === "A") setTool("heal");
      else if (e.key === "m" || e.key === "M") {
        setTool("mask");
        setEditTab("mask");
      }
      else if (e.key === "[") setBrush((b) => ({ ...b, size: Math.max(4, b.size - 6) }));
      else if (e.key === "]") setBrush((b) => ({ ...b, size: Math.min(280, b.size + 6) }));
      else if (e.key === "0") fitToView();
      else if (e.key === "Escape") setSelectedId(null);
      else if (e.key === "\\") {
        e.preventDefault();
        setBypass(true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
      if (e.key === "\\") setBypass(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [deleteLayer, duplicateLayer, exportPng, fitToView, redo, undo]);

  return {
    layers,
    selectedId,
    selected,
    setSelectedId,
    tool,
    setTool,
    zoom,
    setZoom,
    pan,
    setPan,
    doc,
    brush,
    setBrush,
    wandTolerance,
    setWandTolerance,
    aiBusy,
    aiStage,
    aiThreshold,
    setAiThreshold,
    aiFeather,
    setAiFeather,
    paper,
    setPaper,
    tick,
    bump,
    toast,
    busy,
    canUndo,
    canRedo,
    spaceDown,
    viewportRef,
    fileRef,
    layersRef,
    addFiles,
    loadSample,
    updateLayer,
    mutateSelected,
    setOpacity,
    setBlend,
    toggleVisible,
    toggleLock,
    deleteLayer,
    duplicateLayer,
    reorder,
    moveLayer,
    applyAutoRemove,
    applyResetMask,
    applyInvertMask,
    applyFeather,
    applyWand,
    exportPng,
    undo,
    redo,
    commit,
    fitToView,
    clearAll,
    flash,
    bypass,
    setBypass,
    editTab,
    setEditTab,
    setAdjust,
    setLook,
    resetAdjust,
    autoTone,
    flipLayer,
    draw,
    setDraw,
    cloneSource,
    setCloneSource,
    maskShape,
    setMaskShape,
    showMask,
    setShowMask,
    addTextLayer,
    updateText,
    addDrawLayer,
    applyCollage,
    applyFrame,
    applyFormat,
    formatId,
  };
}

function pause(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type EditorModel = ReturnType<typeof useEditor>;
