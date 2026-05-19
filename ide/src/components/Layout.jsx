import React, { useState, useEffect } from "react";
import Split from "react-split";
import Sidebar from "./Sidebar";
import EditorArea from "./EditorArea";
import Preview from "./Preview";
import Console from "./Console";
import DownloadButton from "./DownloadButton";
import { FaCode, FaDesktop, FaTerminal, FaFolder } from "react-icons/fa";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("editor"); // files, editor, preview, console

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-[#2d2d2d] border-b border-[#1e1e1e] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
            <img src="/vite.svg" alt="Logo" className="w-6 h-6" />
            <span className="text-white font-semibold tracking-wide">Flash IDE</span>
        </div>
        <DownloadButton />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {isMobile ? (
          <div className="flex-1 w-full h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
                {activeTab === "files" && <Sidebar />}
                {activeTab === "editor" && <EditorArea />}
                {activeTab === "preview" && <Preview />}
                {activeTab === "console" && <Console isMobile={true} />}
            </div>
            
            {/* Mobile Navigation */}
            <div className="h-14 bg-[#2d2d2d] border-t border-[#1e1e1e] flex items-center justify-around shrink-0 text-zinc-400">
                <button 
                    onClick={() => setActiveTab("files")}
                    className={`flex flex-col items-center gap-1 ${activeTab === "files" ? "text-blue-500" : ""}`}
                >
                    <FaFolder size={18} />
                    <span className="text-[10px]">Files</span>
                </button>
                <button 
                    onClick={() => setActiveTab("editor")}
                    className={`flex flex-col items-center gap-1 ${activeTab === "editor" ? "text-blue-500" : ""}`}
                >
                    <FaCode size={18} />
                    <span className="text-[10px]">Code</span>
                </button>
                <button 
                    onClick={() => setActiveTab("preview")}
                    className={`flex flex-col items-center gap-1 ${activeTab === "preview" ? "text-blue-500" : ""}`}
                >
                    <FaDesktop size={18} />
                    <span className="text-[10px]">Preview</span>
                </button>
                <button 
                    onClick={() => setActiveTab("console")}
                    className={`flex flex-col items-center gap-1 ${activeTab === "console" ? "text-blue-500" : ""}`}
                >
                    <FaTerminal size={18} />
                    <span className="text-[10px]">Console</span>
                </button>
            </div>
          </div>
        ) : (
          <Split 
              sizes={[20, 80]} 
              minSize={150} 
              expandToMin={false} 
              gutterSize={4}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              className="flex w-full"
              cursor="col-resize"
          >
              <div className="h-full overflow-hidden">
                  <Sidebar />
              </div>
              
              <div className="flex flex-col h-full overflow-hidden">
                   <Split
                      sizes={[50, 50]}
                      minSize={100}
                      direction="horizontal"
                      className="flex-1 flex"
                      gutterSize={4}
                   >
                      <div className="h-full overflow-hidden">
                          <EditorArea />
                      </div>
                      <div className="h-full overflow-hidden">
                          <Preview />
                      </div>
                   </Split>
                   <Console />
              </div>
          </Split>
        )}
      </div>
    </div>
  );
};

export default Layout;
