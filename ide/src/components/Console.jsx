import React, { useEffect, useState, useRef } from "react";
import { FaTerminal, FaBan, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Console = ({ isMobile = false }) => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data.type === "console") {
        setLogs((prev) => [...prev, { level: e.data.level, args: e.data.args, time: new Date() }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  // In mobile mode, we ignore the isOpen toggle and always take full height
  const containerClass = isMobile 
    ? "flex flex-col bg-zinc-900 h-full w-full"
    : `flex flex-col bg-zinc-900 border-t border-zinc-700 transition-all duration-300 ${isOpen ? "h-48" : "h-9"}`;

  return (
    <div className={containerClass}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-zinc-800 cursor-pointer select-none"
        onClick={() => !isMobile && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <FaTerminal size={12} />
          <span className="font-semibold">Console</span>
          <span className="bg-zinc-700 px-2 rounded-full text-xs">{logs.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); clearLogs(); }}
            className="text-zinc-400 hover:text-white"
            title="Clear Console"
          >
            <FaBan size={12} />
          </button>
          {!isMobile && (
             isOpen ? <FaChevronDown className="text-zinc-400" /> : <FaChevronUp className="text-zinc-400" />
          )}
        </div>
      </div>

      {/* Logs Area */}
      {(isOpen || isMobile) && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {logs.length === 0 && (
            <div className="text-zinc-500 italic px-2">Console is empty</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-2 border-b border-zinc-800 py-1 ${
                log.level === 'error' ? 'text-red-400' : 
                log.level === 'warn' ? 'text-yellow-400' : 'text-zinc-300'
            }`}>
              <span className="text-zinc-600 min-w-[70px]">{log.time.toLocaleTimeString()}</span>
              <div className="flex-1 break-words">
                {log.args.map((arg, j) => (
                    <span key={j} className="mr-2">
                        {typeof arg === 'object' ? JSON.stringify(arg) : String(arg)}
                    </span>
                ))}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
};

export default Console;
