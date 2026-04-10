import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsPlusCircle } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import { Modal, Button, Card, Form, Table } from "react-bootstrap";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subject_id: "",
    course_id: "",
    subject_name: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5500/subjects/viewsubjects"
      );
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching subjects");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImage(e.target.files[0]);

  // Add subject
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("subject_id", formData.subject_id);
    data.append("course_id", formData.course_id);
    data.append("subject_name", formData.subject_name);
    data.append("description", formData.description);
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5500/subjects/addsubjects", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Subject added successfully!");
      setFormData({
        subject_id: "",
        course_id: "",
        subject_name: "",
        description: "",
      });
      setImage(null);
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert("Error adding subject");
    }
  };

  // Delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;
    try {
      await axios.delete(`http://localhost:5500/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert("Error deleting subject");
    }
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
    fontSize: "12px",
    fontWeight: "600",
  };

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
        marginLeft: "0",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h2
          className="fw-bold text-dark mb-1 text-center"
          style={{ fontSize: "28px" }}
        >
          Subject Management
        </h2>
      </motion.div>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Subjects</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowModal(true)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                <BsPlusCircle className="me-1" />
                Add Subject
              </Button>
            </motion.div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table
              hover
              responsive
              className="mb-0"
              style={{
                tableLayout: "fixed",
                width: "95%",
                margin: "0 auto",
              }}
            >
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "35%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Subject ID
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Course ID
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Subject Name
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Description
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Image
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((sub, index) => (
                    <motion.tr
                      key={sub.subject_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{
                        backgroundColor: "rgba(52, 152, 219, 0.1)",
                        transition: { duration: 0.2 },
                      }}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.subject_id}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.course_id}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.subject_name}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        <div
                          style={{
                            maxHeight: "35px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.2",
                          }}
                        >
                          {sub.description}
                        </div>
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        {sub.image ? (
                          <img
                            src={`http://localhost:5500/uploads/${sub.image}`}
                            alt={sub.subject_name}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "35px",
                              objectFit: "cover",
                              border: "1px solid #3498db",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "35px",
                              background: "#ecf0f1",
                              border: "1px dashed #bdc3c7",
                              fontSize: "9px",
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(sub.subject_id)}
                            style={{
                              border: "1px solid #e74c3c",
                              color: "#e74c3c",
                              padding: "2px 6px",
                              fontSize: "10px",
                            }}
                          >
                            <MdDelete />
                          </Button>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div
                        style={{
                          fontSize: "32px",
                          color: "#bdc3c7",
                          marginBottom: "8px",
                        }}
                      >
                        <BsPlusCircle />
                      </div>
                      <h6 className="text-muted">No subjects found</h6>
                      <p className="text-muted small">
                        Add your first subject to get started
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-muted" style={{ fontSize: "12px" }}>
          Total Subjects: {subjects.length} | Last updated:{" "}
          {new Date().toLocaleString()}
        </p>
      </motion.div>

      {/* Add Subject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
            color: "white",
          }}
        >
          <Modal.Title>Add New Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              {
                name: "subject_id",
                label: "Subject ID",
                type: "text",
                required: true,
              },
              {
                name: "course_id",
                label: "Course ID",
                type: "text",
                required: false,
              },
              {
                name: "subject_name",
                label: "Subject Name",
                type: "text",
                required: true,
              },
            ].map((field) => (
              <Form.Group className="mb-3" key={field.name}>
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#2c3e50", fontSize: "14px" }}
                >
                  {field.label}
                </Form.Label>
                <Form.Control
                  type={field.type}
                  name={field.name}
                  placeholder={`Enter ${field.label}`}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "10px",
                    fontSize: "14px",
                  }}
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
                style={{ color: "#2c3e50", fontSize: "14px" }}
              >
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter subject description"
                value={formData.description}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  padding: "10px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label
                className="fw-semibold"
                style={{ color: "#2c3e50", fontSize: "14px" }}
              >
                Subject Image
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  padding: "10px",
                  fontSize: "14px",
                }}
              />
            </Form.Group>

            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    background:
                      "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 40px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Add Subject
                </Button>
              </motion.div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Subjects;
