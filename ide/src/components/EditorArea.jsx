import React from "react";
import Editor from "@monaco-editor/react";
import { useFile } from "../context/FileContext";

const EditorArea = () => {
  const { activeFile, updateFileContent } = useFile();

  if (!activeFile) return <div className="h-full bg-zinc-900 text-white flex items-center justify-center">No file selected</div>;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
       <div className="bg-[#1e1e1e] text-zinc-400 text-xs px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
         <span>{activeFile.name}</span>
       </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeFile.language}
          theme="vs-dark"
          value={activeFile.content}
          onChange={(value) => updateFileContent(activeFile.id, value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};

export default EditorArea;
