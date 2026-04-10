import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { SiCoursera } from "react-icons/si";
import { FaBookOpen, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { clearTeacherSession, getTeacherProfile } from "./teacherDataStorage";

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const teacherProfile = getTeacherProfile();

  const handleLogout = () => {
    clearTeacherSession();
    navigate("/");
  };

  const links = [
    {
      to: "/teacher/dashboard",
      label: "Dashboard",
      caption: "Overview and stats",
      icon: <RiDashboardHorizontalLine />,
    },
    {
      to: "/teacher/courses",
      label: "Courses",
      caption: "Manage your catalog",
      icon: <FaBookOpen />,
    },
    {
      to: "/teacher/syllabus",
      label: "Syllabus",
      caption: "Upload topic videos",
      icon: <SiCoursera />,
    },
  ];

  return (
    <div
      className="d-flex flex-column text-white h-100"
      style={{
        width: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #172554 54%, #1d4ed8 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "18px 0 40px rgba(15, 23, 42, 0.18)",
      }}
    >
      <div className="px-4 pt-4 pb-3 border-bottom position-relative" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-link text-white p-0 position-absolute top-0 end-0 mt-3 me-3 lg-hidden d-lg-none"
            style={{ textDecoration: 'none' }}
          >
            <FaTimes size={20} />
          </button>
        )}
        
        <div
          className="rounded-4 p-3"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}
        >
          <div className="small text-uppercase fw-semibold opacity-75 mb-2">
            Teacher Workspace
          </div>
          <div className="fw-bold fs-5">{teacherProfile?.name || "Instructor Panel"}</div>
          <div className="small opacity-75">
            {teacherProfile?.specialization ||
              teacherProfile?.qualification ||
              teacherProfile?.email ||
              "Course Manager"}
          </div>
        </div>
      </div>

      <Nav className="flex-column gap-2 px-3 py-4 flex-grow-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <Nav.Item key={link.to}>
              <Nav.Link
                as={Link}
                to={link.to}
                onClick={() => onClose && onClose()}
                className="teacher-sidebar-link"
                style={{
                  borderRadius: "18px",
                  padding: "14px 14px",
                  background: isActive ? "rgba(255,255,255,0.14)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.16)"
                    : "1px solid transparent",
                  boxShadow: isActive ? "0 10px 24px rgba(15,23,42,0.16)" : "none",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-4"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: isActive ? "#fff" : "rgba(255,255,255,0.08)",
                      color: isActive ? "#1d4ed8" : "#fff",
                      fontSize: "18px",
                    }}
                  >
                    {link.icon}
                  </div>
                  <div>
                    <div className="fw-semibold text-white">{link.label}</div>
                    <div className="small opacity-75">{link.caption}</div>
                  </div>
                </div>
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>

      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-100 d-flex align-items-center justify-content-between rounded-4 border-0 text-white px-3 py-3"
          style={{
            background: "rgba(255,255,255,0.1)",
            boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
          }}
        >
          <span className="d-flex align-items-center gap-3">
            <span
              className="d-flex align-items-center justify-content-center rounded-4"
              style={{
                width: "40px",
                height: "40px",
                background: "rgba(255,255,255,0.12)",
              }}
            >
              <FaSignOutAlt />
            </span>
            <span className="text-start">
              <span className="d-block fw-semibold">Logout</span>
              <span className="small opacity-75">Exit teacher panel</span>
            </span>
          </span>
        </button>
      </div>

      <style>
        {`
          .teacher-sidebar-link {
            text-decoration: none !important;
            color: inherit !important;
            transition: all 0.25s ease;
          }

          .teacher-sidebar-link:hover {
            transform: translateX(3px);
            background: rgba(255,255,255,0.1) !important;
            border-color: rgba(255,255,255,0.14) !important;
          }
        `}
      </style>
    </div>
  );
}

export default Sidebar;
