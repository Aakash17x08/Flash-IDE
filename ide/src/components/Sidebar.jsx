import React, { useState } from "react";
import { useFile } from "../context/FileContext";
import { FaFileCode, FaJs, FaCss3, FaHtml5, FaPlus, FaTrash, FaFolder, FaRobot } from "react-icons/fa";
import AIChat from "./AIChat";

const Sidebar = () => {
  const { files, activeFileId, setActiveFileId, addFile, deleteFile } = useFile();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [activeTab, setActiveTab] = useState("explorer"); // explorer | ai

  const getIcon = (name) => {
    if (name.endsWith(".html")) return <FaHtml5 className="text-orange-500" />;
    if (name.endsWith(".css")) return <FaCss3 className="text-blue-500" />;
    if (name.endsWith(".js")) return <FaJs className="text-yellow-500" />;
    return <FaFileCode className="text-gray-400" />;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newFileName) return;
    
    let lang = "javascript";
    if (newFileName.endsWith(".html")) lang = "html";
    else if (newFileName.endsWith(".css")) lang = "css";
    
    addFile(newFileName, lang);
    setNewFileName("");
    setIsCreating(false);
  };

  return (
    <div className="h-full bg-zinc-900 text-white flex flex-col border-r border-zinc-700">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab("explorer")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "explorer" ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <FaFolder /> Explorer
        </button>
        <button 
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "ai" ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <FaRobot /> AI Chat
        </button>
      </div>

      {activeTab === "explorer" ? (
        <>
          <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
            <span className="font-semibold uppercase text-xs tracking-wider text-zinc-400">Files</span>
            <button 
              onClick={() => setIsCreating(true)}
              className="hover:bg-zinc-700 p-1 rounded text-zinc-400 hover:text-white"
            >
              <FaPlus size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm group ${
                  activeFileId === file.id ? "bg-zinc-800 text-white border-l-2 border-blue-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {getIcon(file.name)}
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}

            {isCreating && (
              <form onSubmit={handleCreate} className="px-4 py-2">
                <input
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => setIsCreating(false)}
                  placeholder="filename.ext"
                  className="w-full bg-zinc-800 text-white px-2 py-1 rounded text-sm outline-none border border-blue-500"
                />
              </form>
            )}
          </div>
        </>
      ) : (
        <AIChat />
      )}
    </div>
  );
};

export default Sidebar;
