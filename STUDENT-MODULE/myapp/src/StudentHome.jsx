import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5500";

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // PUBLIC API – no token required
      const res = await axios.get(`${API}/course/all-courses`);
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (course) => {
    const raw = course.image_url || "";

    if (!raw) return null;

    if (/^https?:\/\//.test(raw)) {
      return raw + `?t=${new Date().getTime()}`;
    }

    return `${API}${raw.startsWith("/") ? "" : "/"}${raw}?t=${new Date().getTime()}`;
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bold">🎓 All Courses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row g-4">
          {courses.map((course) => {
            const imgUrl = getImageUrl(course);

            return (
              <div key={course.course_id} className="col-md-4">
                <div className="card h-100 shadow-sm">

                  {/* Image */}
                  <div style={{ height: "200px", overflow: "hidden" }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={course.course_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 bg-secondary text-white">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold">{course.course_name}</h5>

                    <p className="text-muted small flex-grow-1">
                      {course.description?.slice(0, 100)}...
                    </p>

                    <div className="mt-auto">
                      <p className="fw-bold text-primary">
                        ₹{course.discount_price || course.original_price || 0}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}