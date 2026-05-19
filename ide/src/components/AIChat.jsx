import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaCheck, FaCopy } from "react-icons/fa";
import { useFile } from "../context/FileContext";

const CodeBlock = ({ part, files, activeFile, updateFileContent }) => {
  const match = part.match(/```(\w*)\s*\r?\n([\s\S]*?)```/);
  const code = match ? match[2].trim() : part.slice(3, -3).trim();
  const language = match ? match[1].toLowerCase() : "";

  // Auto-detect the best target file based on language extension
  const getBestTargetFile = () => {
    if (language === "html") {
      const htmlFile = files.find(f => f.name.endsWith(".html"));
      if (htmlFile) return htmlFile.id;
    } else if (language === "css") {
      const cssFile = files.find(f => f.name.endsWith(".css"));
      if (cssFile) return cssFile.id;
    } else if (language === "javascript" || language === "js") {
      const jsFile = files.find(f => f.name.endsWith(".js"));
      if (jsFile) return jsFile.id;
    }
    return activeFile?.id || files[0]?.id;
  };

  const [targetFileId, setTargetFileId] = useState(getBestTargetFile);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Sync target file default selection when activeFile changes
  useEffect(() => {
    setTargetFileId(getBestTargetFile());
  }, [activeFile, language]);

  const handleApply = () => {
    updateFileContent(targetFileId, code);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 bg-[#0d0e11] rounded-lg overflow-hidden border border-zinc-700 shadow-md w-full flex flex-col">
      <div className="flex justify-between items-center px-3 py-1.5 bg-zinc-800 text-xs font-semibold text-zinc-300 border-b border-zinc-700 sticky top-0 z-10 flex-wrap gap-2">
        <span className="uppercase tracking-wider text-blue-400 font-mono">{language || "code"}</span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-normal">Apply to:</span>
          <select 
            value={targetFileId}
            onChange={(e) => setTargetFileId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            {files.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button 
            onClick={handleApply}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-white font-medium transition-colors ${
              applied ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <FaCheck size={10} /> {applied ? "Applied!" : "Apply"}
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
          >
            <FaCopy size={10} /> {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="p-3 text-xs overflow-x-auto text-green-400 font-mono whitespace-pre w-full">
        {code}
      </pre>
    </div>
  );
};

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm Flash AI. How can I help you with your code today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  
  const { files, activeFile, updateFileContent } = useFile();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = `
Current File: ${activeFile?.name || "No file selected"}
Language: ${activeFile?.language || "text"}
Content:
\`\`\`
${activeFile?.content || ""}
\`\`\`

User Request: ${input}

If you provide code, please wrap it in \`\`\` code blocks.
`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: context }),
      });

      const data = await res.json();
      
      const aiMsg = { role: "ai", content: data.result || "Sorry, I couldn't generate a response." };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Error connecting to AI server." }]);
    }
    setLoading(false);
  };

  const looksLikeCode = (str) => {
    const codeIndicators = [
      /^\s*<!DOCTYPE/i,
      /^\s*<html/i,
      /^\s*<div/i,
      /^\s*const\s+\w+\s*=/m,
      /^\s*function\s+\w+\s*\(/m,
      /^\s*import\s+[\s\S]+?\s+from/m,
      /^\s*body\s*\{/m,
      /^\s*html\s*\{/m,
      /^\s*@import/m,
      /^\s*\{\s*$/m
    ];
    return codeIndicators.some(regex => regex.test(str));
  };

  const renderMessageContent = (content) => {
    const hasCodeBlocks = content.includes("```");
    
    // Fallback: If no markdown code block is found but the text looks like raw code
    if (!hasCodeBlocks && looksLikeCode(content)) {
      const simulatedPart = `\`\`\`${activeFile?.language || "html"}\n${content}\n\`\`\``;
      return (
        <CodeBlock 
          part={simulatedPart} 
          files={files} 
          activeFile={activeFile} 
          updateFileContent={updateFileContent} 
        />
      );
    }

    // Split messages into text segments and markdown code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        return (
          <CodeBlock 
            key={index}
            part={part} 
            files={files} 
            activeFile={activeFile} 
            updateFileContent={updateFileContent} 
          />
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-blue-600' : 'bg-green-600'}`}>
                {msg.role === 'ai' ? <FaRobot size={14} /> : <FaUser size={14} />}
            </div>
            <div className={`p-3 rounded-lg text-sm max-w-[85%] ${msg.role === 'ai' ? 'bg-zinc-800' : 'bg-blue-900'}`}>
                {msg.role === 'ai' ? renderMessageContent(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-500 text-xs italic text-center">AI is thinking...</div>}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-zinc-700 bg-zinc-800">
        <div className="flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask AI..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button 
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded disabled:opacity-50"
            >
                <FaPaperPlane size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
