import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import { getStoredUser } from "./auth";
import { getRoleConfig } from "./roleConfig";

const Main = () => {
  const roleConfig = getRoleConfig(getStoredUser());

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: "230px", flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div
          style={{
            flexGrow: 1,
            padding: "20px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div className="mb-3">
            <h4 className="mb-1">{roleConfig.dashboardTitle}</h4>
            <small className="text-muted">{roleConfig.moduleTitle}</small>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Main;
