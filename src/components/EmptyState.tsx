import { ImagePlus, Layers3, Sparkles } from "lucide-react";
import { SAMPLE_PROJECTS } from "../lib/samples";
import { useEditorContext } from "../editor/EditorContext";
import { logoUrl } from "../brand";

export function EmptyState() {
  const { addFiles, loadSample, fileRef } = useEditorContext();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-700/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-900/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-8 py-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <img
            src={logoUrl}
            alt=""
            className="mb-6 h-20 w-20 object-contain drop-shadow-[0_20px_40px_rgba(212,180,131,0.25)]"
          />
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.42em] text-gold/80">
            PhotoPolishPlus
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-tight text-stone-100 sm:text-6xl">
            Stack light.
            <span className="italic text-gold"> Carve shadow.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-stone-400">
            Drop several photographs, treat each as a layer, fade visibility, blend overlays,
            then brush or auto-cut the background until the composite sings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="group mx-auto mb-10 flex w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-10 transition hover:border-gold/40 hover:bg-gold/[0.04]"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold transition group-hover:scale-105">
            <ImagePlus className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-stone-200">Drop multiple photos</span>
          <span className="mt-1 text-xs text-stone-500">or click to browse — PNG, JPG, WEBP</span>
        </button>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Start from a sample stack</p>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-stone-600">
            <Layers3 className="h-3 w-3" /> three plates
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SAMPLE_PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadSample(p.id)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 text-left transition hover:-translate-y-0.5 hover:border-gold/30"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={p.cover}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold">
                  <Sparkles className="h-3 w-3" />
                  sample
                </div>
                <h3 className="font-serif text-xl text-stone-50">{p.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-stone-300/80">{p.blurb}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
