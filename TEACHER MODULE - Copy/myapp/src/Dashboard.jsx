import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaUserGraduate,
  FaBookOpen,
  FaCheckCircle,
  FaDollarSign,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAuthToken, getStoredUser } from "./auth";
import { getRoleConfig } from "./roleConfig";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const roleConfig = getRoleConfig(getStoredUser());

  useEffect(() => {
    const parseNumber = (value) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value !== "string") return 0;

      const numericValue = Number.parseFloat(value.replace(/[^\d.]/g, ""));
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const getEnrollmentCount = (course) => {
      if (Array.isArray(course?.students)) return course.students.length;
      if (Array.isArray(course?.enrolled_students)) return course.enrolled_students.length;

      return (
        parseNumber(course?.student_count) ||
        parseNumber(course?.students_count) ||
        parseNumber(course?.enrolled_count) ||
        parseNumber(course?.total_students)
      );
    };

    const fetchDashboardData = async () => {
      try {
        const token = getAuthToken();
        const [coursesRes, syllabusRes] = await Promise.all([
          axios.get("http://localhost:5500/course/my-courses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("http://localhost:5500/syllabus/getAll"),
        ]);

        const fetchedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const fetchedSyllabus = Array.isArray(syllabusRes.data) ? syllabusRes.data : [];
        const courseIds = new Set(
          fetchedCourses
            .map((course) => String(course.course_id || "").trim())
            .filter(Boolean)
        );

        setCourses(
          fetchedCourses.map((course) => ({
            ...course,
            enrollmentCount: getEnrollmentCount(course),
            priceValue: parseNumber(course?.price),
          }))
        );
        setSyllabus(
          fetchedSyllabus.filter((item) =>
            courseIds.has(String(item.course_id || "").trim())
          )
        );
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.enrollmentCount || 0),
    0
  );
  const totalRevenue = courses.reduce(
    (sum, course) => sum + (course.priceValue || 0),
    0
  );
  const totalTopics = syllabus.length;
  const totalTutorials = syllabus.filter((item) => item.tutorial).length;
  const completionRate = totalTopics
    ? Math.round((totalTutorials / totalTopics) * 100)
    : 0;
  const chartData = courses.map((course) => {
    const courseId = String(course.course_id || "").trim();
    const courseTopics = syllabus.filter(
      (item) => String(item.course_id || "").trim() === courseId
    );

    return {
      name: course.course_name || course.title || courseId || "Course",
      topics: courseTopics.length,
      tutorials: courseTopics.filter((item) => item.tutorial).length,
      students: course.enrollmentCount || 0,
    };
  });

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
  if (error) return <h3 className="text-danger text-center">{error}</h3>;

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container>
        <Row className="g-4 mb-4">
          <Col md={3} sm={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <FaUserGraduate size={35} className="text-primary me-3" />
                <div>
                  <h5 className="mb-0">{totalStudents}</h5>
                  <small className="text-muted">
                    {roleConfig.label === "Student" ? "Classmates" : "Enrolled Students"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <FaBookOpen size={35} className="text-primary me-3" />
                <div>
                  <h5 className="mb-0">{courses.length}</h5>
                  <small className="text-muted">
                    {roleConfig.label === "Student" ? "Enrolled Courses" : "Courses"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <FaCheckCircle size={35} className="text-success me-3" />
                <div>
                  <h5 className="mb-0">{completionRate}%</h5>
                  <small className="text-muted">
                    {roleConfig.label === "Admin" ? "Platform Health" : "Tutorial Coverage"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <FaDollarSign size={35} className="text-warning me-3" />
                <div>
                  <h5 className="mb-0">
                    {roleConfig.label === "Student"
                      ? totalTopics
                      : `Rs ${totalRevenue.toLocaleString("en-IN")}`}
                  </h5>
                  <small className="text-muted">
                    {roleConfig.label === "Student" ? "Learning Topics" : "Revenue"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
              <Card className="shadow-sm">
              <Card.Body>
                <h5>Topics by Course</h5>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="topics" stroke="#0d6efd" />
                      <Line type="monotone" dataKey="students" stroke="#9ec5fe" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
              <Card className="shadow-sm">
              <Card.Body>
                <h5>Tutorial Uploads</h5>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tutorials" fill="#0dcaf0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <h4 className="mb-3">
              {roleConfig.label === "Student" ? "Enrolled Courses" : "My Courses"}
            </h4>
          </Col>
        </Row>

        <Row>
          {courses.length === 0 ? (
            <Col>
              <p>No courses found</p>
            </Col>
          ) : (
            courses.map((course) => (
              <Col md={4} key={course.course_id} className="mb-3">
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5>{course.title || course.course_name}</h5>
                    <p className="mb-0">Rs {course.price || 0}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
}
