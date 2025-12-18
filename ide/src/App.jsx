import React, { useEffect, useState } from "react";
import "./App.css";
import Editor from "@monaco-editor/react";

const App = () => {
  /* ---------- STATES ---------- */
  const [tab, setTab] = useState("html");
  const [htmlCode, setHtmlCode] = useState(
    () =>
      localStorage.getItem("htmlCode") ||
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`
  );
  const [cssCode, setCssCode] = useState(
    () =>
      localStorage.getItem("cssCode") ||
      `body {
  background: #fff;
  color: #000;
}`
  );
  const [jsCode, setJsCode] = useState(
    () => localStorage.getItem("jsCode") || `console.log('Hello, World!');`
  );

  const [theme, setTheme] = useState("vs-dark");
  const [consoleOutput, setConsoleOutput] = useState([]);

  /* ---------- AI STATES ---------- */
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  /* ---------- RUN CODE ---------- */
  const run = () => {
    const css = `<style>${cssCode}</style>`;
    const js = `<script>
      const originalLog = console.log;
      console.log = function(...args) {
        parent.postMessage({ type: 'log', message: args }, '*');
        originalLog.apply(console, args);
      };
      ${jsCode}
    <\/script>`;

    const iframe = document.getElementById("iframe");
    if (iframe) {
      iframe.srcdoc = htmlCode + css + js;
    }
  };

  /* ---------- CONSOLE LOGS ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.data.type === "log") {
        setConsoleOutput((prev) => [...prev, e.data.message.join(" ")]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ---------- LOCAL STORAGE ---------- */
  useEffect(() => {
    localStorage.setItem("htmlCode", htmlCode);
    run();
  }, [htmlCode]);

  useEffect(() => {
    localStorage.setItem("cssCode", cssCode);
    run();
  }, [cssCode]);

  useEffect(() => {
    localStorage.setItem("jsCode", jsCode);
    run();
  }, [jsCode]);

  useEffect(() => {
    run();
  }, []);

  /* ---------- AI FUNCTION ---------- */
  const askAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate only ${tab.toUpperCase()} code.\nDo not explain.\n${aiPrompt}`,
        }),
      });

      const data = await res.json();

      if (tab === "html") setHtmlCode(data.result);
      if (tab === "css") setCssCode(data.result);
      if (tab === "js") setJsCode(data.result);
    } catch (err) {
      console.error("AI Error", err);
    }

    setAiLoading(false);
    setAiPrompt("");
  };

  return (
    <>
      {/* ---------- NAVBAR ---------- */}
      <div className="nav flex items-center bg-zinc-800 h-[70px] justify-between px-4 md:px-12 shadow-md">
        <h2 className="text-lg md:text-xl font-semibold text-white">Flash IDE</h2>
        <button
          onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
          className="border-2 border-white text-white px-4 py-1 rounded-2xl hover:bg-white hover:text-zinc-800"
        >
          Toggle Theme
        </button>
      </div>

      <div
        className="con flex flex-col md:flex-row w-full"
        style={{ minHeight: "calc(100vh - 70px)" }}
      >
        {/* ---------- EDITOR ---------- */}
        <div className="md:w-1/2 w-full">
          {/* Tabs */}
          <div className="tabs pt-2 px-4 flex gap-2">
            {["html", "css", "js"].map((t) => (
              <div
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1 rounded-2xl cursor-pointer
                  ${tab === t ? "bg-white text-zinc-800 font-semibold" : "bg-zinc-800 text-white"}`}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>

          {/* ---------- AI INPUT ---------- */}
          <div className="flex gap-2 px-4 mt-3 py-3">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to generate code..."
              className="flex-1 px-3 py-3 rounded-lg text-white outline-none bg-zinc-800 "
            />

            <button
              onClick={askAI}
              className="bg-zinc-600 text-white px-4 rounded-lg hover:bg-red-500"
            >
              {aiLoading ? "Thinking..." : "Ask AI"}
            </button>
          </div>

          {/* ---------- EDITOR ---------- */}
          <div className="editor-container px-2 md:px-4">
            {tab === "html" && (
              <Editor
                height="70vh"
                language="html"
                theme={theme}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e || "")}
              />
            )}
            {tab === "css" && (
              <Editor
                height="70vh"
                language="css"
                theme={theme}
                value={cssCode}
                onChange={(e) => setCssCode(e || "")}
              />
            )}
            {tab === "js" && (
              <Editor
                height="70vh"
                language="javascript"
                theme={theme}
                value={jsCode}
                onChange={(e) => setJsCode(e || "")}
              />
            )}
          </div>
        </div>

        {/* ---------- OUTPUT ---------- */}
        <div className="md:w-1/2 w-full p-2 flex flex-col">
          <iframe
            id="iframe"
            className="w-full bg-white flex-1 border rounded-lg"
          ></iframe>

          <div className="bg-[#1E1E1E] text-green-400 mt-2 p-2 h-[30vh] overflow-auto rounded-lg">
            <h3 className="text-white mb-1 font-medium">Console Output:</h3>
            {consoleOutput.map((log, i) => (
              <div key={i} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
