import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import {
  getCoursePrice,
  getLocalPurchasedCourses,
  savePaymentHistoryToLocal,
  savePurchasedCoursesToLocal,
} from "./purchaseStorage";

const API = "http://localhost:5500";

const normalizeArrayPayload = (payload) => {
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
};

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [cartCourseIds, setCartCourseIds] = useState([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const cartContext = useContext(CartContext);
  const student = JSON.parse(localStorage.getItem("student") || "null");
  const student_id = student?.student_id;

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/course/all-courses`);
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const loadStudentCourseState = useCallback(async () => {
    if (!student_id) {
      setCartCourseIds([]);
      setPurchasedCourseIds([]);
      return;
    }

    try {
      const localPurchasedCourses = getLocalPurchasedCourses(student);

      const [cartResult, purchaseResult] = await Promise.allSettled([
        axios
          .get(`${API}/cart/viewcart/${student_id}`)
          .catch(() => axios.get(`${API}/cart/viewcart?user_id=${student_id}`)),
        axios.get(`${API}/course/my-purchases/${student_id}`),
      ]);

      const serverCartItems =
        cartResult.status === "fulfilled"
          ? normalizeArrayPayload(cartResult.value.data)
          : [];
      const serverPurchasedCourses =
        purchaseResult.status === "fulfilled"
          ? normalizeArrayPayload(purchaseResult.value.data)
          : [];

      setCartCourseIds(
        serverCartItems
          .map((item) => Number(item?.course_id ?? item?.id))
          .filter((id) => Number.isFinite(id))
      );

      setPurchasedCourseIds(
        [...localPurchasedCourses, ...serverPurchasedCourses]
          .map((item) => Number(item?.course_id ?? item?.id))
          .filter((id) => Number.isFinite(id))
      );
    } catch (error) {
      console.error("Failed to load cart and purchase state:", error);
      setPurchasedCourseIds(
        getLocalPurchasedCourses(student)
          .map((item) => Number(item?.course_id ?? item?.id))
          .filter((id) => Number.isFinite(id))
      );
    }
  }, [student, student_id]);

  useEffect(() => {
    loadStudentCourseState();

    const handleUpdates = () => {
      loadStudentCourseState();
    };

    window.addEventListener("cart-updated", handleUpdates);
    window.addEventListener("purchase-updated", handleUpdates);

    return () => {
      window.removeEventListener("cart-updated", handleUpdates);
      window.removeEventListener("purchase-updated", handleUpdates);
    };
  }, [loadStudentCourseState]);

  const addToCart = useCallback(async (course_id, options = {}) => {
    const { silent = false } = options;

    try {
      if (!student_id) {
        localStorage.setItem("pendingCartCourseId", String(course_id));
        localStorage.setItem("postLoginRedirectPath", location.pathname);
        navigate("/login");
        return;
      }

      setAddingId(course_id);

      await axios.post(`${API}/cart/addtocart`, {
        course_id,
        user_id: student_id,
      });

      localStorage.removeItem("pendingCartCourseId");
      localStorage.removeItem("postLoginRedirectPath");

      if (!silent) {
        alert("Added to Cart");
      }

      await cartContext?.refreshCartCount?.();
      window.dispatchEvent(new Event("cart-updated"));
      setCartCourseIds((prev) =>
        prev.includes(course_id) ? prev : [...prev, course_id]
      );
    } catch (error) {
      console.error("Add to cart error:", error);

      if (!silent) {
        alert("Error adding to cart");
      }
    } finally {
      setAddingId(null);
    }
  }, [cartContext, location.pathname, navigate, student_id]);

  useEffect(() => {
    const pendingCourseId = localStorage.getItem("pendingCartCourseId");

    if (!student_id || !pendingCourseId) {
      return;
    }

    addToCart(Number(pendingCourseId), { silent: true });
  }, [addToCart, student_id]);

  const handleEnroll = useCallback(async (course) => {
    const courseId = Number(course?.course_id);
    const coursePrice = getCoursePrice(course);

    try {
      if (!student_id) {
        localStorage.setItem("pendingEnrollCourseId", String(courseId));
        localStorage.setItem("postLoginRedirectPath", location.pathname);
        navigate("/login");
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check index.html");
        return;
      }

      if (purchasedCourseIds.includes(courseId)) {
        navigate("/dashboard");
        return;
      }

      setEnrollingId(courseId);

      const options = {
        key: "rzp_test_S2wFC8cGw4pUpL",
        amount: coursePrice * 100,
        currency: "INR",
        name: "Teach Hub",
        description: `${course.course_name} Enrollment`,
        handler: async function (response) {
          console.log("Payment ID:", response.razorpay_payment_id);
          alert("Payment Successful");

          try {
            const cartRes = await axios
              .get(`${API}/cart/viewcart/${student_id}`)
              .catch(() => axios.get(`${API}/cart/viewcart?user_id=${student_id}`));

            const cartItems = normalizeArrayPayload(cartRes?.data);
            const existingCartItem = cartItems.find(
              (item) => Number(item?.course_id) === courseId
            );

            if (existingCartItem?.cartid) {
              await axios.delete(`${API}/cart/${existingCartItem.cartid}`);
            }
          } catch (cleanupError) {
            console.error("Cart cleanup after enroll failed:", cleanupError);
          }

          localStorage.removeItem("pendingEnrollCourseId");
          savePurchasedCoursesToLocal(student, [course]);
          savePaymentHistoryToLocal(
            student,
            [course],
            response.razorpay_payment_id
          );
          await cartContext?.refreshCartCount?.();
          window.dispatchEvent(new Event("cart-updated"));
          window.dispatchEvent(new Event("purchase-updated"));
          setPurchasedCourseIds((prev) =>
            prev.includes(courseId) ? prev : [...prev, courseId]
          );
          setCartCourseIds((prev) => prev.filter((id) => id !== courseId));
          setEnrollingId(null);
          navigate("/dashboard");
        },
        prefill: {
          name: student?.name || "Student",
          email: student?.email || "",
        },
        modal: {
          ondismiss: () => {
            setEnrollingId(null);
          },
        },
        theme: {
          color: "#6D28D9",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setEnrollingId(null);
      });
      rzp.open();
    } catch (error) {
      console.error("Enroll payment error:", error);
      setEnrollingId(null);
      alert("Payment failed");
    }
  }, [
    cartContext,
    location.pathname,
    navigate,
    purchasedCourseIds,
    student,
    student_id,
  ]);

  useEffect(() => {
    const pendingEnrollCourseId = localStorage.getItem("pendingEnrollCourseId");

    if (!student_id || !pendingEnrollCourseId || courses.length === 0) {
      return;
    }

    const pendingCourse = courses.find(
      (course) => Number(course.course_id) === Number(pendingEnrollCourseId)
    );

    if (pendingCourse) {
      handleEnroll(pendingCourse);
    }
  }, [courses, handleEnroll, student_id]);

  const getImageUrl = (course) => {
    const rawImage = course?.image_url || course?.image || "";

    if (!rawImage) {
      return "https://placehold.co/400x250/e2e8f0/475569?text=Course";
    }

    if (/^https?:\/\//i.test(rawImage)) {
      return rawImage;
    }

    return `${API}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="mb-10 text-3xl font-bold">Featured Courses</h2>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const courseId = Number(course?.course_id);
            const isPurchased = purchasedCourseIds.includes(courseId);
            const isInCart = cartCourseIds.includes(courseId);

            return (
              <div
                key={course.course_id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:shadow-2xl"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(course)}
                    alt={course.course_name}
                    className="h-48 w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold leading-tight">
                    {course.course_name}
                  </h3>

                  <p className="mb-3 text-sm text-gray-500">
                    {course.description?.substring(0, 60) || "Course available now"}...
                  </p>

                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {course.duration || "Self-paced"}
                    </span>

                    <span className="font-medium text-yellow-500">4.8</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-black">
                      Rs. {getCoursePrice(course)}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(courseId)}
                        disabled={addingId === courseId || isPurchased || isInCart}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                          addingId === courseId
                            ? "cursor-not-allowed bg-gray-400 text-white"
                            : isPurchased
                              ? "cursor-not-allowed bg-emerald-600 text-white"
                              : isInCart
                                ? "cursor-not-allowed bg-amber-500 text-white"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {addingId === courseId
                          ? "Adding..."
                          : isPurchased
                            ? "Purchased"
                            : isInCart
                              ? "Added"
                              : "Add to Cart"}
                      </button>

                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={enrollingId === courseId || isPurchased}
                        className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isPurchased
                          ? "Purchased"
                          : enrollingId === courseId
                            ? "Processing..."
                            : "Enroll Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No courses found</p>
      )}
    </div>
  );
}
