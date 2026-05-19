import React from "react";
import { FaDownload } from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useFile } from "../context/FileContext";

const DownloadButton = () => {
  const { files } = useFile();

  const handleDownload = async () => {
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "flash-project.zip");
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors"
    >
      <FaDownload size={12} />
      <span>Export</span>
    </button>
  );
};

export default DownloadButton;
