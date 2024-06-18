import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProfileForm from "./components/ProfileForm";
import ProfileView from "./components/ProfileView";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ProfileForm />} />
      <Route path="/profiles" element={<ProfileView />} />
      <Route path="*" element={<Navigate to="/" />} />{" "}
    </Routes>
  );
};

export default App;
