import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    description: "",
    duration: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("teacherToken");

      const res = await axios.get(
        "http://localhost:5500/course/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD COURSE =================
  const handleAddCourse = async () => {
    const token = localStorage.getItem("teacherToken");

    const data = new FormData();
    data.append("course_name", formData.course_name);
    data.append("description", formData.description);
    data.append("duration", formData.duration);
    if (formData.image) data.append("image", formData.image);

    try {
      await axios.post(
        "http://localhost:5500/course/addcourse",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetForm();
      fetchCourses();
      alert("Course Added Successfully!");
    } catch (err) {
      alert("Add Failed!");
    }
  };

  // ================= UPDATE COURSE =================
  const handleUpdateCourse = async () => {
    const token = localStorage.getItem("teacherToken");

    const data = new FormData();
    data.append("course_name", formData.course_name);
    data.append("description", formData.description);
    data.append("duration", formData.duration);
    if (formData.image) data.append("image", formData.image);

    try {
      await axios.put(
        `http://localhost:5500/course/updatecourse/${editingId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetForm();
      alert("Course Updated Successfully!");
      fetchCourses();
    } catch (err) {
      alert("Update Failed!");
    }
  };

  // ================= DELETE COURSE =================
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?"))
      return;

    const token = localStorage.getItem("teacherToken");

    try {
      await axios.delete(
        `http://localhost:5500/course/deletecourse/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course Deleted Successfully!");
      fetchCourses();
    } catch (err) {
      alert("Delete Failed!");
    }
  };

  // ================= EDIT CLICK =================
  const handleEditClick = (course) => {
    setEditMode(true);
    setEditingId(course.course_id);

    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      description: course.description,
      duration: course.duration,
      image: null,
    });

    if (course.image_url) {
      setImagePreview(
        `http://localhost:5500${course.image_url}`
      );
    }

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditingId(null);
    setShowForm(false);
    setFormData({
      course_id: "",
      course_name: "",
      description: "",
      duration: "",
      image: null,
    });
    setImagePreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🎓 My Courses</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditMode(false);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Close Form" : "Add Course"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 shadow-lg rounded mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editMode ? "Edit Course" : "Add Course"}
          </h3>

          <input
            type="text"
            placeholder="Course Name"
            value={formData.course_name}
            className="border p-2 w-full mb-3"
            onChange={(e) =>
              setFormData({ ...formData, course_name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Duration"
            value={formData.duration}
            className="border p-2 w-full mb-3"
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            className="border p-2 w-full mb-3"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <input type="file" onChange={handleImageChange} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 mt-3"
            />
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={
                editMode ? handleUpdateCourse : handleAddCourse
              }
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editMode ? "Update Course" : "Save Course"}
            </button>

            <button
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* COURSE GRID */}
    {/* COURSE GRID */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {courses.map((c) => {

    let imgUrl = null;

    // Image path handling
    if (c.image_url) {
      imgUrl = c.image_url.startsWith("http")
        ? c.image_url
        : `http://localhost:5500${c.image_url}`;
    } else if (c.image) {
      imgUrl = c.image.startsWith("http")
        ? c.image
        : `http://localhost:5500/uploads/${c.image}`;
    }

    return (
      <div
        key={c.course_id}
        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition"
      >

        {/* IMAGE SECTION */}
        <div className="h-48 bg-gray-200 overflow-hidden">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={c.course_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl">
              📚
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">
            {c.course_name}
          </h3>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {c.description}
          </p>

          <p className="text-sm mb-4 text-gray-500">
            ⏱ {c.duration}
          </p>

          {/* BUTTONS SECTION */}
          <div className="flex gap-2">
            <button
              onClick={() => handleEditClick(c)}
              className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm hover:bg-yellow-600 transition"
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleDeleteCourse(c.course_id)
              }
              className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700 transition"
            >
              Delete
            </button>

            <button
              onClick={() =>
                navigate(`/teacher/course/${c.course_id}`)
              }
              className="flex-1 bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition"
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}
