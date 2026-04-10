import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { SiDiscourse, SiCoursera } from "react-icons/si";
import { getStoredUser } from "./auth";
import { getRoleConfig } from "./roleConfig";

function Sidebar() {
  const location = useLocation();
  const roleConfig = getRoleConfig(getStoredUser());
  const iconMap = {
    "/dashboard": <RiDashboardHorizontalLine />,
    "/dashboard/course": <SiDiscourse />,
    "/dashboard/syllabus": <SiCoursera />,
  };

  const links = roleConfig.sidebarLinks.map((link) => ({
    ...link,
    icon: iconMap[link.to],
  }));

  return (
    <div
      className="d-flex flex-column vh-100"
      style={{
        width: "230px",
        background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
        borderRight: "1px solid #ddd",
        boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="text-center pt-3 pb-2 border-bottom"
        style={{ borderColor: "rgba(255,255,255,0.2)" }}
      >
        <h6 className="text-white">{roleConfig.dashboardTitle}</h6>
      </div>

      <Nav
        className="flex-column p-2 gap-1 fs-6 flex-grow-1"
        style={{ paddingTop: "0px" }}
      >
        {links.map((link) => (
          <Nav.Item key={link.to}>
            <Nav.Link
              as={Link}
              to={link.to}
              className={`d-flex align-items-center gap-2 sidebar-link ${
                location.pathname === link.to ? "active-link" : ""
              }`}
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                marginBottom: "2px",
                transition: "all 0.3s ease",
              }}
            >
              <span
                className="icon d-flex align-items-center justify-content-center"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
              >
                {link.icon}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {link.label}
              </span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div
        className="p-2 border-top"
        style={{ borderColor: "rgba(255,255,255,0.2)" }}
      >
        <div className="text-center">
          <small className="text-light opacity-75" style={{ fontSize: "10px" }}>
            © 2026 {roleConfig.moduleTitle}
          </small>
        </div>
      </div>

      <style>
        {`
          .sidebar-link {
            color: rgba(255, 255, 255, 0.9) !important;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            transform: translateX(3px);
            color: white !important;
          }

          .active-link {
            background: rgba(255, 255, 255, 0.25) !important;
            font-weight: 600;
            color: white !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          .active-link .icon {
            color: #3498db !important;
            transform: scale(1.1);
          }

          .sidebar-link:hover .icon {
            transform: scale(1.1);
            color: #3498db !important;
          }

          .icon {
            color: rgba(255, 255, 255, 0.8) !important;
            transition: all 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}

export default Sidebar;
