import React from "react";
import { Outlet } from "react-router-dom";
import Teachersidebar from "./Teachersidebar";

function DashboardLayout() {
  return (
    <div className="d-flex">
      
      {/* Sidebar */}
      <div style={{ width: "230px" }}>
        <Teachersidebar />
      </div>

      {/* Dynamic Content */}
      <div className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </div>

    </div>
  );

}