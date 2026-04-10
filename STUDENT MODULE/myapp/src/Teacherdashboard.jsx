import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";
import { FaBookOpen, FaLayerGroup, FaVideo } from "react-icons/fa6";
import {
  getLocalTeacherTopics,
  getTeacherProfile,
  mergeSyllabusData,
  saveTeacherProfile,
} from "./teacherDataStorage";

const API = "http://localhost:5500";

export default function Teacherdashboard() {
  const [courses, setCourses] = useState([]);
  const [remoteTopics, setRemoteTopics] = useState([]);
  const [localTopics, setLocalTopics] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeacherData = useCallback(async () => {
    try {
      const token = localStorage.getItem("teacherToken");

      if (!token) {
        setError("Teacher session not found.");
        setLoading(false);
        return;
      }

      const [coursesRes, syllabusRes] = await Promise.allSettled([
        axios.get(`${API}/course/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/syllabus/my-syllabus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (coursesRes.status === "fulfilled") {
        setCourses(Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []);
      } else {
        setCourses([]);
      }

      if (syllabusRes.status === "fulfilled") {
        setRemoteTopics(Array.isArray(syllabusRes.value.data) ? syllabusRes.value.data : []);
      } else {
        setRemoteTopics([]);
      }

      try {
        const profileRes = await axios.get(`${API}/teacher/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes?.data) {
          saveTeacherProfile(profileRes.data);
          setTeacherProfile(getTeacherProfile());
        }
      } catch (profileError) {
        const fallbackProfile =
          coursesRes.status === "fulfilled"
            ? coursesRes.value.data?.[0]?.teacher || coursesRes.value.data?.[0]?.teacher_details
            : null;

        if (fallbackProfile) {
          saveTeacherProfile(fallbackProfile);
          setTeacherProfile(getTeacherProfile());
        }
      }

      setError("");
    } catch (fetchError) {
      console.error("Error fetching teacher dashboard data:", fetchError);
      setError("Dashboard data could not be loaded from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTeacherProfile(getTeacherProfile());
    setLocalTopics(getLocalTeacherTopics());
    fetchTeacherData();
  }, [fetchTeacherData]);

  const allTopics = useMemo(
    () => mergeSyllabusData(remoteTopics || [], localTopics || []),
    [localTopics, remoteTopics]
  );

  const tutorialCount = useMemo(
    () =>
      allTopics.reduce((total, topic) => {
        const count =
          Array.isArray(topic.videos) && topic.videos.length > 0
            ? topic.videos.length
            : topic.video_url || topic.video_name
              ? 1
              : 0;

        return total + count;
      }, 0),
    [allTopics]
  );

  const teacherName = teacherProfile?.name || "Teacher";
  const teacherEmail = teacherProfile?.email || "No email available";
  const teacherInitials =
    teacherName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) => namePart[0]?.toUpperCase())
      .join("") || "T";

  const statCards = [
    {
      label: "Courses",
      value: courses.length,
      icon: <FaBookOpen />,
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
    {
      label: "Topics",
      value: allTopics.length,
      icon: <FaLayerGroup />,
      color: "#b45309",
      bg: "#fff7ed",
    },
    {
      label: "Tutorials",
      value: tutorialCount,
      icon: <FaVideo />,
      color: "#047857",
      bg: "#ecfdf5",
    },
  ];

  return (
    <div
      className="min-vh-100 py-4 py-lg-5"
      style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }}
    >
      <Container fluid className="px-3 px-lg-4">
        {error && <Alert variant="warning">{error}</Alert>}

        <Card
          className="border-0 rounded-5 overflow-hidden mb-4"
          style={{ boxShadow: "0 22px 60px rgba(15, 23, 42, 0.08)" }}
        >
          <Card.Body className="p-0">
            <Row className="g-0">
              <Col lg={7}>
                <div
                  className="h-100 p-4 p-md-5 text-white text-center text-lg-start"
                  style={{ background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" }}
                >
                  <div
                    className="small text-uppercase fw-semibold mb-3 d-inline-flex align-items-center rounded-pill px-3 py-2"
                    style={{
                      letterSpacing: "0.14em",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    Teacher Dashboard
                  </div>

                  <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 flex-wrap">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "72px",
                        height: "72px",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "1.35rem",
                        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.18)",
                      }}
                    >
                      {teacherInitials}
                    </div>
                    <div>
                      <h1 className="fw-bold mb-1" style={{ letterSpacing: "-0.03em" }}>
                        {teacherName}
                      </h1>
                      <p className="mb-0" style={{ color: "rgba(255,255,255,0.78)" }}>
                        {teacherEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={5}>
                <div className="h-100 p-4 p-md-5" style={{ background: "#ffffff" }}>
                  <div className="small text-uppercase text-muted fw-semibold mb-3">Profile</div>
                  <div
                    className="rounded-4 px-3 py-3 px-md-4 py-md-4 h-100"
                    style={{ border: "1px solid #e2e8f0", background: "#f8fafc" }}
                  >
                    <div className="small text-muted mb-1">Name</div>
                    <div className="fw-bold fs-5 mb-3" style={{ color: "#0f172a" }}>
                      {teacherName}
                    </div>
                    <div className="small text-muted mb-1">Email</div>
                    <div
                      className="fw-semibold small text-md-base"
                      style={{ color: "#0f172a", wordBreak: "break-word" }}
                    >
                      {teacherEmail}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {statCards.map((card) => (
            <Col lg={4} sm={6} key={card.label}>
              <Card
                className="border-0 shadow-sm rounded-5 h-100"
                style={{
                  background: card.bg,
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="small text-uppercase text-muted fw-semibold mb-2">
                        {card.label}
                      </div>
                      <div className="display-6 fw-bold" style={{ color: "#0f172a" }}>
                        {loading ? "..." : card.value}
                      </div>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-4"
                      style={{
                        width: "56px",
                        height: "56px",
                        background: "#ffffff",
                        color: card.color,
                        fontSize: "20px",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {card.icon}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
