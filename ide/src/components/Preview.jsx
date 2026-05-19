import React, { useEffect, useRef, useState } from "react";
import { useFile } from "../context/FileContext";
import { FaSyncAlt } from "react-icons/fa";

const Preview = () => {
  const { files } = useFile();
  const iframeRef = useRef(null);
  const [key, setKey] = useState(0); // To force re-render iframe

  const refresh = () => {
    setKey((prev) => prev + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      run();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [files, key]);

  const run = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 1. Find the entry HTML file
    const htmlFile = files.find(f => f.name === "index.html") || files.find(f => f.name.endsWith(".html"));
    
    if (!htmlFile) {
      iframe.srcdoc = "<h1 style='color:white; font-family: sans-serif; text-align: center; margin-top: 20px;'>No HTML file found</h1>";
      return;
    }

    let htmlContent = htmlFile.content;

    // 2. Inject CSS
    // Strategy: Replace <link rel="stylesheet" href="..."> with <style>...</style>
    // OR just append all CSS files if specific links not found?
    // Let's do a smarter replacement.
    
    // Find all CSS files
    const cssFiles = files.filter(f => f.name.endsWith(".css"));
    cssFiles.forEach(cssFile => {
        const linkTagRegex = new RegExp(`<link[^>]+href=["']${cssFile.name}["'][^>]*>`, 'i');
        if (linkTagRegex.test(htmlContent)) {
             htmlContent = htmlContent.replace(linkTagRegex, `<style>${cssFile.content}</style>`);
        } else {
            // Fallback: if not linked, maybe just append to head? No, standard behavior is only if linked.
            // But for "CodePen" style, usually it's auto-injected. 
            // Let's stick to explicit linking for "Advanced" feel, but provide a fallback if no link tags exist at all maybe?
            // Actually, let's just stick to replacing known links. 
            // If the user didn't link it, it doesn't show. That's how real IDEs work.
        }
    });

    // 3. Inject JS
    const jsFiles = files.filter(f => f.name.endsWith(".js"));
    jsFiles.forEach(jsFile => {
         const scriptTagRegex = new RegExp(`<script[^>]+src=["']${jsFile.name}["'][^>]*></script>`, 'i');
         if (scriptTagRegex.test(htmlContent)) {
             // Intercept console.log before injecting user code
             const code = `
                try {
                    ${jsFile.content}
                } catch(err) {
                    console.error(err);
                }
             `;
             htmlContent = htmlContent.replace(scriptTagRegex, `<script>${code}</script>`);
         }
    });

    // Console capture script
    const consoleScript = `
      <script>
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        function sendToParent(type, args) {
             try {
                parent.postMessage({ type: 'console', level: type, args: args }, '*');
             } catch(e) {}
        }

        console.log = function(...args) {
          sendToParent('log', args);
          originalLog.apply(console, args);
        };
        console.error = function(...args) {
          sendToParent('error', args);
          originalError.apply(console, args);
        };
        console.warn = function(...args) {
          sendToParent('warn', args);
          originalWarn.apply(console, args);
        };
      </script>
    `;

    // Inject console script at the beginning of head or body
    if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", "<head>" + consoleScript);
    } else {
        htmlContent = consoleScript + htmlContent;
    }

    iframe.srcdoc = htmlContent;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex justify-between items-center">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Preview</span>
        <button onClick={refresh} className="text-zinc-600 hover:text-blue-500">
          <FaSyncAlt size={12} />
        </button>
      </div>
      <iframe
        key={key}
        ref={iframeRef}
        title="preview"
        className="flex-1 w-full h-full border-none bg-white"
        sandbox="allow-scripts allow-modals"
      />
    </div>
  );
};

export default Preview;
