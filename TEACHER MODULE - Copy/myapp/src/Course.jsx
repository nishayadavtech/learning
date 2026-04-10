import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Card, Table } from "react-bootstrap";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import { getAuthToken, getStoredUser } from "./auth";
import { getRoleConfig } from "./roleConfig";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formCourse, setFormCourse] = useState({
    course_id: "",
    course_name: "",
    description: "",
    duration: "",
    image: null,
  });
  const roleConfig = getRoleConfig(getStoredUser());
  const canManageCourses = roleConfig.canManageCourses;
  const token = getAuthToken();

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5500/course/my-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormCourse({
      ...formCourse,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleAddOrUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("course_id", formCourse.course_id);
      formData.append("course_name", formCourse.course_name);
      formData.append("description", formCourse.description);
      formData.append("duration", formCourse.duration);
      if (formCourse.image) formData.append("image", formCourse.image);

      if (editMode) {
        await axios.put(
          `http://localhost:5500/course/updatecourse/${formCourse.course_id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Course updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5500/course/addcourse",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Course added successfully!");
      }

      setShowModal(false);
      setEditMode(false);
      setFormCourse({
        course_id: "",
        course_name: "",
        description: "",
        duration: "",
        image: null,
      });

      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      alert("Failed to save course.");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:5500/course/deletecourse/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Course deleted successfully!");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    }
  };

  const openEditModal = (course) => {
    setEditMode(true);
    setFormCourse({
      course_id: course.course_id,
      course_name: course.course_name,
      description: course.description,
      duration: course.duration,
      image: null,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormCourse({
      course_id: "",
      course_name: "",
      description: "",
      duration: "",
      image: null,
    });
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-3" style={{ minHeight: "100vh" }}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>{roleConfig.label === "Student" ? "Available Courses" : "All Courses"}</span>
          {canManageCourses && (
            <Button size="sm" onClick={openAddModal}>
              <FaPlus /> Add Course
            </Button>
          )}
        </Card.Header>

        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>S.No</th>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Image</th>
                {canManageCourses && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {Array.isArray(courses) && courses.length > 0 ? (
                courses.map((course, index) => (
                  <tr key={course.course_id}>
                    <td>{index + 1}</td>
                    <td>{course.course_id}</td>
                    <td>{course.course_name}</td>
                    <td>{course.description}</td>
                    <td>{course.duration}</td>
                    <td>
                      {course.image_url ? (
                        <img
                          src={`http://localhost:5500/${course.image_url}`}
                          alt=""
                          width="60"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    {canManageCourses && (
                      <td>
                        <Button size="sm" onClick={() => openEditModal(course)}>
                          <FaEdit />
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteCourse(course.course_id)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageCourses ? "7" : "6"} className="text-center">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {canManageCourses && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? "Edit Course" : "Add Course"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input className="form-control mb-2" name="course_id" placeholder="ID" value={formCourse.course_id} onChange={handleChange} disabled={editMode} />
            <input className="form-control mb-2" name="course_name" placeholder="Name" value={formCourse.course_name} onChange={handleChange} />
            <textarea className="form-control mb-2" name="description" placeholder="Description" value={formCourse.description} onChange={handleChange} />
            <input className="form-control mb-2" name="duration" placeholder="Duration" value={formCourse.duration} onChange={handleChange} />
            <input type="file" className="form-control" name="image" onChange={handleChange} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleAddOrUpdate}>
              {editMode ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Course;
