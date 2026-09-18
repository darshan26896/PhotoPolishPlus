import { EditorProvider, useEditorContext } from "./editor/EditorContext";
import { TopBar } from "./components/TopBar";
import { ToolRail } from "./components/ToolRail";
import { CanvasStage } from "./components/CanvasStage";
import { LayersPanel } from "./components/LayersPanel";
import { Inspector } from "./components/Inspector";

export default function App() {
  return (
    <EditorProvider>
      <Shell />
    </EditorProvider>
  );
}

function Shell() {
  const { fileRef, addFiles, toast } = useEditorContext();

  return (
    <div className="relative flex h-screen select-none flex-col overflow-hidden bg-[#080808] text-stone-100">
      <div className="pointer-events-none absolute inset-0 z-50 grain" />
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <CanvasStage />
        <aside className="flex w-[320px] shrink-0 flex-col border-l border-white/10 bg-[#0c0c0e]">
          <LayersPanel />
          <div className="max-h-[58%] overflow-y-auto border-t border-white/5">
            <Inspector />
          </div>
        </aside>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-gold/25 bg-[#141414]/95 px-5 py-2 font-serif text-sm text-gold shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
