import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Teachersidebar from "./Teachersidebar";
import { FaBars } from "react-icons/fa";

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Teachersidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-indigo-600">TeachHub</span>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#edf2f7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
