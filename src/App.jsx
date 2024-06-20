import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProfileForm from "./components/ProfileForm";
import ProfileView from "./components/ProfileView";
import Maps from "./components/Maps";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/form" element={<ProfileForm />} />
      <Route path="/profiles" element={<ProfileView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/maps" element={<Maps />} />
    </Routes>
  );
};

export default App;
