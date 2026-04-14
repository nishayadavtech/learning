import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBookOpen,
  FaCheckCircle,
  FaDollarSign,
} from "react-icons/fa";
import {
  getCoursePrice,
  getLocalPaymentHistory,
  getLocalPurchasedCourses,
} from "./purchaseStorage";

export default function Studentdashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const normalizeArrayPayload = useCallback((payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.cart)) {
      return payload.cart;
    }

    if (Array.isArray(payload?.items)) {
      return payload.items;
    }

    return [];
  }, []);

  const getCourseImage = useCallback((course) => {
    const rawImage = course?.image_url || course?.image || course?.thumbnail || "";

    if (!rawImage) {
      return `https://placehold.co/400x250/e2e8f0/475569?text=${encodeURIComponent(
        course?.course_name || "Course"
      )}`;
    }

    if (/^https?:\/\//i.test(rawImage)) {
      return rawImage;
    }

    return `http://localhost:5500${
      rawImage.startsWith("/") ? rawImage : `/${rawImage}`
    }`;
  }, []);

  const mergeCoursesById = useCallback((primaryCourses, fallbackCourses) => {
    const mergedMap = new Map();

    [...fallbackCourses, ...primaryCourses].forEach((course) => {
      const courseId = Number(course?.course_id ?? course?.id);

      if (Number.isFinite(courseId)) {
        mergedMap.set(courseId, { ...course, course_id: courseId });
      }
    });

    return Array.from(mergedMap.values());
  }, []);

  const fetchStudentDashboardData = useCallback(async () => {
    try {
      const student = JSON.parse(localStorage.getItem("student") || "null");

      if (!student?.student_id) {
        localStorage.setItem("postLoginRedirectPath", "/dashboard");
        navigate("/login");
        return;
      }

      setStudentInfo(student);

      const localPurchasedCourses = getLocalPurchasedCourses(student);
      const paymentHistory = getLocalPaymentHistory(student);
      const paymentCourses = paymentHistory.map((item) => item.course).filter(Boolean);

      const [purchaseResult, cartResult] = await Promise.allSettled([
        axios.get(`http://localhost:5500/course/my-purchases/${student.student_id}`),
        axios
          .get(`http://localhost:5500/cart/viewcart/${student.student_id}`)
          .catch(() =>
            axios.get(
              `http://localhost:5500/cart/viewcart?user_id=${student.student_id}`
            )
          ),
      ]);

      const serverPurchasedCourses =
        purchaseResult.status === "fulfilled"
          ? normalizeArrayPayload(purchaseResult.value.data)
          : [];

      if (purchaseResult.status === "rejected") {
        console.error("Purchased courses fetch failed:", purchaseResult.reason);
      }

      const serverCartItems =
        cartResult.status === "fulfilled"
          ? normalizeArrayPayload(cartResult.value.data)
          : [];

      if (cartResult.status === "rejected") {
        console.error("Cart courses fetch failed:", cartResult.reason);
      }

      setPurchasedCourses(
        mergeCoursesById(serverPurchasedCourses, [
          ...localPurchasedCourses,
          ...paymentCourses,
        ])
      );
      setCartItems(serverCartItems);
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      setPurchasedCourses([]);
      setCartItems([]);
    }
  }, [
    mergeCoursesById,
    navigate,
    normalizeArrayPayload,
  ]);

  useEffect(() => {
    fetchStudentDashboardData();

    const handleUpdates = () => {
      fetchStudentDashboardData();
    };

    window.addEventListener("cart-updated", handleUpdates);
    window.addEventListener("purchase-updated", handleUpdates);

    return () => {
      window.removeEventListener("cart-updated", handleUpdates);
      window.removeEventListener("purchase-updated", handleUpdates);
    };
  }, [fetchStudentDashboardData]);

  const paymentHistory = studentInfo ? getLocalPaymentHistory(studentInfo) : [];
  const totalSpent = paymentHistory.length
    ? paymentHistory.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
    : purchasedCourses.reduce((sum, course) => sum + getCoursePrice(course), 0);
  const totalCartValue = cartItems.reduce(
    (sum, course) => sum + getCoursePrice(course),
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("postLoginRedirectPath");
    localStorage.removeItem("pendingCartCourseId");
    navigate("/login");
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-1">Student Dashboard</h3>
            <p className="text-muted mb-0">
              {studentInfo?.name
                ? `${studentInfo.name}, yahan aapke cart aur purchased courses dikhte hain.`
                : "Yahan aapke cart aur purchased courses dikhte hain."}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>

        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <FaBookOpen size={30} className="text-primary me-3" />
                <div>
                  <h5 className="mb-0">{purchasedCourses.length}</h5>
                  <small>Purchased Courses</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <FaShoppingCart size={30} className="text-primary me-3" />
                <div>
                  <h5 className="mb-0">{cartItems.length}</h5>
                  <small>Add To Cart Items</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <FaCheckCircle size={30} className="text-success me-3" />
                <div>
                  <h5 className="mb-0">Rs. {totalCartValue}</h5>
                  <small>Cart Value</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <FaDollarSign size={30} className="text-warning me-3" />
                <div>
                  <h5 className="mb-0">Rs. {totalSpent}</h5>
                  <small>Total Payment</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h4 className="mb-4">My Purchased Courses</h4>

        {purchasedCourses.length === 0 ? (
          <p>No purchased courses found</p>
        ) : (
          <Row>
            {purchasedCourses.map((course) => (
              <Col md={4} key={course.course_id} className="mb-4">
                <Card className="shadow-sm">
                  <img
                    src={getCourseImage(course)}
                    alt={course.course_name}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x250/e2e8f0/475569?text=${encodeURIComponent(
                        course?.course_name || "Course"
                      )}`;
                    }}
                  />
                  <Card.Body>
                    <h5>{course.course_name}</h5>

                    <p className="text-muted">
                      {course.description}
                    </p>

                    <p className="fw-semibold text-primary mb-2">
                      Rs. {getCoursePrice(course)}
                    </p>

                    <span className="text-success fw-bold">
                      Purchased
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <h4 className="mb-4 mt-5">My Cart Courses</h4>

        {cartItems.length === 0 ? (
          <p>No cart courses found</p>
        ) : (
          <Row>
            {cartItems.map((course) => (
              <Col md={4} key={course.cartid || course.course_id} className="mb-4">
                <Card className="shadow-sm border-0">
                  <img
                    src={getCourseImage(course)}
                    alt={course.course_name || "Course"}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x250/e2e8f0/475569?text=${encodeURIComponent(
                        course?.course_name || "Course"
                      )}`;
                    }}
                  />
                  <Card.Body>
                    <h5>{course.course_name || "Course"}</h5>

                    <p className="text-muted">
                      {course.description || "Course is ready for checkout."}
                    </p>

                    <p className="fw-semibold text-primary mb-2">
                      Rs. {getCoursePrice(course)}
                    </p>

                    <span className="text-warning fw-bold">
                      In Cart
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
