import React, { useEffect, useState } from 'react';
import './App.css';
import Editor from '@monaco-editor/react';

const App = () => {
  const [tab, setTab] = useState('html');
  const [htmlCode, setHtmlCode] = useState(() => localStorage.getItem('htmlCode') || `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`);
  const [cssCode, setCssCode] = useState(() => localStorage.getItem('cssCode') || `body {
  background: #fff;
  color: #000;
}`);
  const [jsCode, setJsCode] = useState(() => localStorage.getItem('jsCode') || `console.log('Hello, World!');`);
  const [theme, setTheme] = useState('vs-dark');
  const [consoleOutput, setConsoleOutput] = useState([]);

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

    const iframe = document.getElementById('iframe');
    if (iframe) {
      iframe.srcdoc = htmlCode + css + js;
    }

  };

  useEffect(() => {
    window.addEventListener('message', (e) => {
      if (e.data.type === 'log') {
        setConsoleOutput((prev) => [...prev, e.data.message.join(' ')]);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('htmlCode', htmlCode);
    run();
  }, [htmlCode]);

  useEffect(() => {
    localStorage.setItem('cssCode', cssCode);
    run();
  }, [cssCode]);

  useEffect(() => {
    localStorage.setItem('jsCode', jsCode);
    run();
  }, [jsCode]);

  useEffect(() => {
    run();
  }, []);

  return (
    <>
      <div className="nav flex items-center bg-zinc-800 h-[70px] justify-between px-4 md:px-12 shadow-md transition-all duration-300 ease-in-out">
        <h2 className='text-lg md:text-xl font-semibold text-white transition-all duration-300 ease-in-out'>Flash IDE</h2>
        <button 
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')} 
          className='border-2 border-white text-white px-3 py-1 md:px-4 md:py-2 rounded-2xl text-sm md:text-base hover:bg-white hover:text-zinc-800 transition-all duration-300 ease-in-out'
        >
          Toggle Theme
        </button>
      </div>
  
      <div className="con flex flex-col md:flex-row w-full transition-all duration-300 ease-in-out" style={{ minHeight: 'calc(100vh - 70px)' }}>
        
        {/* Editor Section */}
        <div className='md:w-1/2 w-full h-full min-w-0'>
          <div className="tabs pt-2 px-4 md:px-6 flex flex-wrap items-center gap-2">
            {['html', 'css', 'js'].map((t) => (
              <div
                key={t}
                onClick={() => setTab(t)}
                className={`tab p-1 md:p-2 px-4 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
                  ${tab === t ? 'bg-white text-zinc-800 font-semibold' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>
  
          <div className="editor-container px-2 md:px-4">
            {tab === 'html' && (
              <Editor
                height="70vh"
                className="pt-2 transition-all duration-300 ease-in-out"
                language="html"
                theme={theme}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e || '')}
              />
            )}
            {tab === 'css' && (
              <Editor
                height="70vh"
                className="pt-2 transition-all duration-300 ease-in-out"
                language="css"
                theme={theme}
                value={cssCode}
                onChange={(e) => setCssCode(e || '')}
              />
            )}
            {tab === 'js' && (
              <Editor
                height="70vh"
                className="pt-2 transition-all duration-300 ease-in-out"
                language="javascript"
                theme={theme}
                value={jsCode}
                onChange={(e) => setJsCode(e || '')}
              />
            )}
          </div>
        </div>
  
        {/* Output Section */}
        <div className='md:w-1/2 w-full p-2 min-w-0 flex flex-col transition-all duration-300 ease-in-out'>
          <iframe 
            id='iframe' 
            className='w-full bg-white flex-1 border rounded-lg shadow-sm transition-all duration-300 ease-in-out'
            style={{ minHeight: '60vh' }} 
          ></iframe>
  
          <div className='bg-[#1E1E1E] text-green-400 mt-2 p-2 h-[30vh] overflow-auto rounded-lg transition-all duration-300 ease-in-out'>
            <h3 className='text-white mb-1 font-medium'>Console Output:</h3>
            <div className="space-y-1">
              {consoleOutput.map((log, i) => (
                <div key={i} className="text-sm font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
};

export default App;
