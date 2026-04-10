import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";
import { Button, Modal, Form, Card, Table, Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import { getAuthToken, getStoredUser } from "./auth";
import { getRoleConfig } from "./roleConfig";

const initialFormState = {
  syllabus_id: "",
  course_id: "",
  subject_id: "",
  topic_name: "",
  description: "",
  tutorial: null,
};

const getTutorialUrl = (tutorialPath) => {
  if (!tutorialPath) return "";
  if (/^https?:\/\//i.test(tutorialPath)) return tutorialPath;
  return `http://localhost:5500${tutorialPath.startsWith("/") ? "" : "/"}${tutorialPath}`;
};

const Syllabus = () => {
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [syllabusData, setSyllabusData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const roleConfig = getRoleConfig(getStoredUser());
  const canManageSyllabus = roleConfig.canManageSyllabus;
  const token = getAuthToken();

  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        id: course.course_id,
        label: course.course_name || course.title || course.course_id,
      })),
    [courses]
  );

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5500/course/my-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  }, [token]);

  const fetchSyllabus = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5500/syllabus/getAll", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const allSyllabus = Array.isArray(res.data) ? res.data : [];
      if (!canManageSyllabus || courses.length === 0) {
        setSyllabusData(allSyllabus);
        return;
      }

      const courseIds = new Set(
        courses.map((course) => String(course.course_id || "").trim()).filter(Boolean)
      );

      setSyllabusData(
        allSyllabus.filter((item) =>
          courseIds.has(String(item.course_id || "").trim())
        )
      );
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      setSyllabusData([]);
    }
  }, [canManageSyllabus, courses, token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(syllabusData.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, syllabusData.length]);

  const totalPages = Math.max(1, Math.ceil(syllabusData.length / itemsPerPage));
  const paginatedSyllabus = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return syllabusData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, syllabusData]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tutorial" ? files[0] || null : value,
    }));
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (syllabus) => {
    setFormData({
      syllabus_id: syllabus.syllabus_id || "",
      course_id: syllabus.course_id || "",
      subject_id: syllabus.subject_id || "",
      topic_name: syllabus.topic_name || "",
      description: syllabus.description || "",
      tutorial: null,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const buildPayload = () => {
    const data = new FormData();
    data.append("syllabus_id", formData.syllabus_id);
    data.append("course_id", formData.course_id);
    data.append("subject_id", formData.subject_id);
    data.append("topic_name", formData.topic_name);
    data.append("description", formData.description);
    if (formData.tutorial) {
      data.append("tutorial", formData.tutorial);
    }
    return data;
  };

  const saveSyllabus = async (payload) => {
    if (!editMode) {
      return axios.post("http://localhost:5500/syllabus/addSyllabus", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    const updateRequests = [
      () =>
        axios.put(
          `http://localhost:5500/syllabus/update/${formData.syllabus_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
      () =>
        axios.put(
          `http://localhost:5500/syllabus/updateSyllabus/${formData.syllabus_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
      () =>
        axios.post(
          `http://localhost:5500/syllabus/update/${formData.syllabus_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
    ];

    let lastError;
    for (const request of updateRequests) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        if (![404, 405].includes(error?.response?.status)) {
          throw error;
        }
      }
    }

    throw lastError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.syllabus_id ||
      !formData.course_id ||
      !formData.subject_id ||
      !formData.topic_name ||
      !formData.description
    ) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveSyllabus(buildPayload());

      Swal.fire(
        "Success",
        res.data?.message ||
          (editMode ? "Syllabus updated successfully" : "Syllabus added successfully"),
        "success"
      );
      setShowModal(false);
      resetForm();
      fetchSyllabus();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving syllabus:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          (editMode ? "Failed to update syllabus" : "Failed to add syllabus"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (syllabusId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This syllabus will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5500/syllabus/delete/${syllabusId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
      Swal.fire("Deleted!", "Syllabus deleted successfully.", "success");
      fetchSyllabus();
    } catch (error) {
      console.error("Error deleting syllabus:", error);
      Swal.fire("Error", "Failed to delete syllabus", "error");
    }
  };

  const handleViewVideo = (tutorialPath) => {
    setSelectedTutorial(getTutorialUrl(tutorialPath));
    setShowVideoModal(true);
  };

  const cardStyle = {
    borderRadius: "14px",
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    background: "white",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: "16px",
    padding: "12px",
    border: "none",
    borderRadius: "14px 14px 0 0",
  };

  const tableHeaderStyle = {
    background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
  };

  const paginationItems = [];
  for (let page = 1; page <= totalPages; page += 1) {
    paginationItems.push(
      <Pagination.Item
        key={page}
        active={page === currentPage}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <h2
        className="fw-bold text-dark mb-4 text-center"
        style={{ fontSize: "28px" }}
      >
        {roleConfig.label === "Student" ? "Learning Plan" : "Syllabus Management"}
      </h2>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>{roleConfig.label === "Student" ? "Course Syllabus" : "All Syllabus"}</span>
            {canManageSyllabus && (
              <Button
                variant="light"
                size="sm"
                onClick={openAddModal}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                <BsPlusCircle className="me-1" />
                Add Syllabus
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table
              hover
              responsive
              className="mb-0"
              style={{ tableLayout: "fixed" }}
            >
              <thead style={tableHeaderStyle}>
                <tr>
                  <th>Syllabus ID</th>
                  <th>Course ID</th>
                  <th>Subject ID</th>
                  <th>Topic Name</th>
                  <th>Description</th>
                  <th>Tutorial</th>
                  {canManageSyllabus && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {syllabusData.length > 0 ? (
                  paginatedSyllabus.map((syllabus) => {
                    const tutorialUrl = getTutorialUrl(syllabus.tutorial);
                    const fileExtension = String(syllabus.tutorial || "")
                      .split(".")
                      .pop()
                      .toLowerCase();
                    const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(
                      fileExtension
                    );
                    const isPdf = fileExtension === "pdf";

                    return (
                      <tr key={syllabus.syllabus_id}>
                        <td>{syllabus.syllabus_id}</td>
                        <td>{syllabus.course_id}</td>
                        <td>{syllabus.subject_id}</td>
                        <td>{syllabus.topic_name}</td>
                        <td>{syllabus.description}</td>
                        <td className="text-center">
                          {syllabus.tutorial ? (
                            <div className="d-flex flex-column align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center gap-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleViewVideo(syllabus.tutorial)}
                              >
                                {isVideo && (
                                  <FaVideo
                                    style={{
                                      color: "#1bd546ff",
                                      fontSize: "20px",
                                    }}
                                  />
                                )}
                                {isPdf && (
                                  <i
                                    className="bi bi-file-earmark-pdf-fill"
                                    style={{
                                      color: "#e74c3c",
                                      fontSize: "20px",
                                    }}
                                  ></i>
                                )}
                                {!isVideo && !isPdf && (
                                  <span className="text-primary small">Open file</span>
                                )}
                              </div>
                              <a
                                href={tutorialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="small"
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted">No Tutorial</span>
                          )}
                        </td>

                        {canManageSyllabus && (
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => openEditModal(syllabus)}
                                style={{
                                  border: "1px solid #3498db",
                                  color: "#3498db",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                }}
                              >
                                <MdEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(syllabus.syllabus_id)}
                                style={{
                                  border: "1px solid #e74c3c",
                                  color: "#e74c3c",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                }}
                              >
                                <MdDelete />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={canManageSyllabus ? "7" : "6"} className="text-center py-5">
                      <div
                        style={{
                          fontSize: "48px",
                          color: "#bdc3c7",
                          marginBottom: "16px",
                        }}
                      >
                        Books
                      </div>
                      <h5 className="text-muted">No syllabus found</h5>
                      <p className="text-muted">
                        Add your first syllabus to get started
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {syllabusData.length > 0 && (
          <Card.Footer className="bg-white border-0 px-3 pb-3 pt-2">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <small className="text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, syllabusData.length)} of{" "}
                {syllabusData.length} entries
              </small>

              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                {paginationItems}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      <Modal
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>View Tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedTutorial ? (
            selectedTutorial.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={selectedTutorial}
                title="PDF Tutorial"
                width="100%"
                height="500px"
              />
            ) : (
              <video
                width="100%"
                height="400"
                controls
                style={{ borderRadius: "8px" }}
              >
                <source src={selectedTutorial} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <p>No tutorial selected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedTutorial && (
            <Button
              variant="success"
              href={selectedTutorial}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowVideoModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {canManageSyllabus && (
        <Modal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            resetForm();
          }}
          centered
        >
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
              color: "white",
            }}
          >
            <Modal.Title>{editMode ? "Edit Syllabus" : "Add New Syllabus"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Syllabus ID</Form.Label>
                <Form.Control
                  type="text"
                  name="syllabus_id"
                  placeholder="Enter Syllabus ID"
                  value={formData.syllabus_id}
                  onChange={handleChange}
                  disabled={editMode}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                {courseOptions.length > 0 ? (
                  <Form.Select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Course</option>
                    {courseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.label}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    name="course_id"
                    placeholder="Enter Course ID"
                    value={formData.course_id}
                    onChange={handleChange}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subject ID</Form.Label>
                <Form.Control
                  type="text"
                  name="subject_id"
                  placeholder="Enter Subject ID"
                  value={formData.subject_id}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Topic Name</Form.Label>
                <Form.Control
                  type="text"
                  name="topic_name"
                  placeholder="Enter Topic Name"
                  value={formData.topic_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Tutorial File (PDF / Video)
                  {editMode ? " - choose a file only if you want to replace it" : ""}
                </Form.Label>
                <Form.Control
                  type="file"
                  name="tutorial"
                  accept=".pdf,.mp4,.mov,.avi,.mkv,.webm"
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="text-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editMode ? "Update Syllabus" : "Add Syllabus"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Syllabus;
