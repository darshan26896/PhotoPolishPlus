import { createContext, useContext, type ReactNode } from "react";
import { useEditor, type EditorModel } from "../hooks/useEditor";

const EditorContext = createContext<EditorModel | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const value = useEditor();
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditorContext() {
  const v = useContext(EditorContext);
  if (!v) throw new Error("EditorProvider missing");
  return v;
}
