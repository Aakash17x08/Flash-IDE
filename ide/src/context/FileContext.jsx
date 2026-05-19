import React, { createContext, useContext, useState, useEffect } from "react";

const FileContext = createContext();

export const useFile = () => useContext(FileContext);

const INITIAL_FILES = [
  {
    id: "index.html",
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, Flash IDE!</h1>
  <p>Edit me in the editor.</p>
  <script src="script.js"></script>
</body>
</html>`,
  },
  {
    id: "style.css",
    name: "style.css",
    language: "css",
    content: `body {
  font-family: sans-serif;
  background: #1e1e1e;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

h1 {
  color: #61dafb;
}`,
  },
  {
    id: "script.js",
    name: "script.js",
    language: "javascript",
    content: `console.log('Hello from Flash IDE!');

document.querySelector('h1').addEventListener('click', () => {
  alert('You clicked the title!');
});`,
  },
];

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("flash-ide-files");
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [activeFileId, setActiveFileId] = useState("index.html");

  useEffect(() => {
    localStorage.setItem("flash-ide-files", JSON.stringify(files));
  }, [files]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const updateFileContent = (id, newContent) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent } : f))
    );
  };

  const addFile = (name, language) => {
    const id = name; // Simple ID for now
    if (files.some((f) => f.id === id)) return; // Prevent duplicates
    setFiles((prev) => [...prev, { id, name, language, content: "" }]);
    setActiveFileId(id);
  };

  const deleteFile = (id) => {
    if (files.length <= 1) return; // Prevent deleting last file
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0].id);
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        activeFile,
        activeFileId,
        setActiveFileId,
        updateFileContent,
        addFile,
        deleteFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
