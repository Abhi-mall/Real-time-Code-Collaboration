import "./App.css";
import React from "react";
import Home from "./components/Home";
import EditorPage from "./components/EditorPage";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center"></Toaster>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/editor/:roomId" element={<EditorPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
