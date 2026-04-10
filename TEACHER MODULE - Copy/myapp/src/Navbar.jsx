import React, { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { FaUser, FaKey, FaSignOutAlt } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChangePassword from "./ChangePassword";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  getUserRole,
  saveAuthSession,
} from "./auth";
import { getRoleConfig } from "./roleConfig";

const resolveMediaUrl = (value, fallback = "https://cdn-icons-png.flaticon.com/512/149/149071.png") => {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;

  const normalizedValue = String(value).replace(/^\/+/, "");
  if (normalizedValue.startsWith("uploads/")) {
    return `http://localhost:5500/${normalizedValue}`;
  }

  return `http://localhost:5500/uploads/${normalizedValue}`;
};

export default function Navbar() {
  const [showChange, setShowChange] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [teacher, setTeacher] = useState(getStoredUser());
  const navigate = useNavigate();
  const role = getUserRole(teacher);
  const roleConfig = getRoleConfig(teacher);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/");
      return;
    }

    if (role !== "teacher") return;

    const fetchProfile = async () => {
      const endpoints = [
        "http://localhost:5500/teacher/profile",
        "http://localhost:5500/teacher/teacherprofile",
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const profile = res.data.profile || res.data.teacher || res.data.user;
          if (profile) {
            setTeacher(profile);
            saveAuthSession({ token, user: profile });
          }
          return;
        } catch (err) {
          if (err.response?.status === 401) {
            alert("Session expired. Please login again.");
            clearAuthSession();
            navigate("/");
            return;
          }
        }
      }
    };

    fetchProfile();
  }, [navigate, role]);

  const logout = () => {
    clearAuthSession();
    alert(`${roleConfig.label} logout successful`);
    navigate("/");
  };

  const profileImage = resolveMediaUrl(
    teacher?.image || teacher?.image_url || teacher?.profileImage || teacher?.avatar
  );
  const teacherId = teacher?.id || teacher?.teacher_id || teacher?.teacherId || "N/A";

  return (
    <>
      <nav
        style={{
          background: "#1f2937",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "50px",
        }}
      >
        <div style={{ fontWeight: "bold", color: "white" }}>
          {roleConfig.dashboardTitle}
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            id="dropdown-basic"
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <img
              src={profileImage}
              alt="profile"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <span>{teacher?.name || roleConfig.label}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setShowProfile(true)}>
              <FaUser className="me-2" /> Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setShowChange(true)}>
              <FaKey className="me-2" /> Change Password
            </Dropdown.Item>
            <Dropdown.Item onClick={logout}>
              <FaSignOutAlt className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </nav>

      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{roleConfig.label} Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {teacher ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                flexWrap: "wrap",
                padding: "20px",
              }}
            >
              <div style={{ flex: "1", textAlign: "center" }}>
                <img
                  src={profileImage}
                  alt="profile"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <h5>{teacher.name}</h5>
                <p>{teacher.email}</p>
              </div>

              <div
                style={{
                  flex: "1",
                  background: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                <p><b>ID:</b> {teacherId}</p>
                <p><b>Name:</b> {teacher.name || "N/A"}</p>
                <p><b>Email:</b> {teacher.email || "N/A"}</p>
                <p><b>Phone:</b> {teacher.phone || "N/A"}</p>
                <p><b>Qualification:</b> {teacher.qualification || "N/A"}</p>
                <p><b>Specialization:</b> {teacher.specialization || "N/A"}</p>
                <p><b>Bio:</b> {teacher.bio || "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="text-center">Loading profile...</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ChangePassword show={showChange} onHide={() => setShowChange(false)} />
    </>
  );
}
