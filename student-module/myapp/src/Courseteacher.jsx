import React, { useEffect, useState } from "react";
import axios from "axios";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
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

        console.log("Response:", res.data);
        setCourses(res.data);
      } catch (error) {
        console.log("Error:", error.response?.data || error.message);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h2>My Courses</h2>

      {courses.length > 0 ? (
        courses.map((course) => (
          <div key={course.course_id} className="border p-4 mb-4 rounded shadow">

            {/* ✅ IMAGE FIXED HERE */}
            {course.image_url && (
              <img
                src={`http://localhost:5500${course.image_url}`}
                alt={course.course_name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}

            <h3>{course.course_name}</h3>
            <p>{course.description}</p>
            <p>Duration: {course.duration}</p>
          </div>
        ))
      ) : (
        <p>No courses found</p>
      )}
    </div>
  );
};

export default TeacherDashboard;