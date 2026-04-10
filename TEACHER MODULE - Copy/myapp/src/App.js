import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Course from "./Course";
import Syllabus from "./Syllabus";
import Main from "./Main";
import { getAuthToken } from "./auth";

/* Protected Route */
const ProtectedRoute = ({ children }) => {
  const token = getAuthToken();
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* ===== AUTH ===== */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ===== DASHBOARD (WITH SIDEBAR) ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      >
        {/* Default dashboard */}
        <Route index element={<Dashboard />} />

        {/* Sidebar pages */}
        <Route path="course" element={<Course />} />
        <Route path="syllabus" element={<Syllabus />} />
      </Route>
    </Routes>
  );
}

export default App;
