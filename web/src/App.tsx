import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Place } from "./components/Place";

const App = () => (
  <Routes>
    <Route path="/app" element={<Place />} />
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route path="*" element={<Page404 />} />
  </Routes>
);

const Page404 = () => {
  return (
    <div className="flex h-screen justify-center items-center">
      <span className="font-thin text-3xl">404 | Page Not Found</span>
    </div>
  );
};

export default App;
