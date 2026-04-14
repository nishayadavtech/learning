import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5500";

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const res = await axios.get(`${API}/course/getallcourses`);
      console.log("all courses ➜", res.data);
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (c) => {
    const raw = c.image_url || c.image || "";
    if (!raw) return null;
    if (/^https?:\/\//.test(raw)) return raw;
    return `${API}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  const handleAddToCart = (course) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const exists = cart.find(
      (item) => item.course_id === (course.course_id || course._id)
    );

    if (exists) {
      exists.quantity += 1;
    } else {
      cart.push({
        course_id: course.course_id || course._id,
        course_name: course.course_name,
        price: course.price || 0,
        discount_price: course.discount_price || course.price || 0,
        image_url: getImageUrl(course),
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`✅ "${course.course_name}" add to cart ho gaya!`);
  };

  const calculateDiscount = (original, discount) => {
    if (!original || !discount) return 0;
    return Math.round(((original - discount) / original) * 100);
  };

  return (
    <div className="container-fluid py-4 bg-light" style={{ minHeight: "100vh" }}>
      <div className="container">

        <div className="mb-4">
          <h2 className="fw-bold">🎓 All Available Courses</h2>
          <p className="text-muted">Browse and enroll in any course</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border"></div>
          </div>
        )}

        {!loading && (
          <>
            {courses.length === 0 ? (
              <div className="alert alert-info text-center py-5">
                No courses available at the moment
              </div>
            ) : (
              <div className="row g-4">
                {courses.map((course) => {
                  const imgUrl = getImageUrl(course);
                  const originalPrice = course.price || 0;
                  const discountPrice = course.discount_price || originalPrice;

                  const discountPercent = calculateDiscount(
                    originalPrice,
                    discountPrice
                  );

                  return (
                    <div
                      key={course.course_id || course._id}
                      className="col-lg-4 col-md-6"
                    >
                      <div className="card h-100 shadow-sm border-0 hover-card">

                        <div
                          className="position-relative overflow-hidden"
                          style={{ height: "200px", backgroundColor: "#f0f0f0" }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={course.course_name}
                              className="card-img-top"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-white">
                              📚 No Image
                            </div>
                          )}

                          {discountPercent > 0 && (
                            <div className="position-absolute top-0 end-0 bg-danger text-white px-3 py-2 m-2 rounded">
                              -{discountPercent}%
                            </div>
                          )}
                        </div>

                        <div className="card-body d-flex flex-column">

                          <h5 className="card-title fw-bold text-dark">
                            {course.course_name}
                          </h5>

                          <p className="card-text text-muted small flex-grow-1">
                            {course.description?.slice(0, 100)}
                            {course.description?.length > 100 ? "..." : ""}
                          </p>

                          <p className="text-muted small mb-3">
                            ⏱️ Duration: <strong>{course.duration || "N/A"}</strong>
                          </p>

                          <div className="mb-3 pb-3 border-bottom">
                            {discountPrice < originalPrice ? (
                              <div>
                                <p className="mb-1">
                                  <span className="text-danger fw-bold" style={{ fontSize: "18px" }}>
                                    ₹{discountPrice.toLocaleString()}
                                  </span>
                                  <span className="text-muted ms-2" style={{ textDecoration: "line-through" }}>
                                    ₹{originalPrice.toLocaleString()}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-primary fw-bold" style={{ fontSize: "18px" }}>
                                ₹{originalPrice.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-primary fw-bold"
                              onClick={() => handleAddToCart(course)}
                            >
                              🛒 Add to Cart
                            </button>

                            <button
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                navigate(`/course/${course.course_id || course._id}`)
                              }
                            >
                              👁️ View Details
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}