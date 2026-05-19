import React from "react";
import Layout from "./components/Layout";
import { FileProvider } from "./context/FileContext";
import "./App.css";

const App = () => {
  return (
    <FileProvider>
      <Layout />
    </FileProvider>
  );
};

export default App;
