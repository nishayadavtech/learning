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

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [cartCourseIds, setCartCourseIds] = useState([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const cartContext = useContext(CartContext);

  const student = JSON.parse(localStorage.getItem("student") || "null");
  const student_id = student?.student_id;

  const getFallbackImage = useCallback((courseName = "Course") => {
    return `https://placehold.co/400x250/e2e8f0/475569?text=${encodeURIComponent(
      courseName
    )}`;
  }, []);

  const getCourseImage = useCallback((course) => {
    const rawImage = course?.image_url || course?.image || course?.thumbnail || "";

    if (!rawImage) {
      return getFallbackImage(course?.course_name);
    }

    if (/^https?:\/\//i.test(rawImage)) {
      return rawImage;
    }

    return `http://localhost:5500${
      rawImage.startsWith("/") ? rawImage : `/${rawImage}`
    }`;
  }, [getFallbackImage]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5500/course/all-courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
          .get(`http://localhost:5500/cart/viewcart/${student_id}`)
          .catch(() =>
            axios.get(`http://localhost:5500/cart/viewcart?user_id=${student_id}`)
          ),
        axios.get(`http://localhost:5500/course/my-purchases/${student_id}`),
      ]);

      const cartRes = cartResult.status === "fulfilled" ? cartResult.value : null;
      const purchaseRes =
        purchaseResult.status === "fulfilled" ? purchaseResult.value : null;

      const cartItems = Array.isArray(cartRes?.data)
        ? cartRes.data
        : Array.isArray(cartRes?.data?.cart)
          ? cartRes.data.cart
          : Array.isArray(cartRes?.data?.data)
            ? cartRes.data.data
            : [];

      const purchasedItems = Array.isArray(purchaseRes?.data)
        ? purchaseRes.data
        : Array.isArray(purchaseRes?.data?.data)
          ? purchaseRes.data.data
          : [];

      setCartCourseIds(
        cartItems
          .map((item) => Number(item.course_id ?? item.id))
          .filter((id) => Number.isFinite(id))
      );

      setPurchasedCourseIds(
        [...localPurchasedCourses, ...purchasedItems]
          .map((item) => Number(item.course_id ?? item.id))
          .filter((id) => Number.isFinite(id))
      );
    } catch (err) {
      console.error("Failed to load cart/purchase state:", err);
      setCartCourseIds((prev) => prev);
      setPurchasedCourseIds(
        getLocalPurchasedCourses(student)
          .map((item) => Number(item.course_id ?? item.id))
          .filter((id) => Number.isFinite(id))
      );
    }
  }, [student, student_id]);

  useEffect(() => {
    loadStudentCourseState();
  }, [loadStudentCourseState]);

  const handleAddToCart = useCallback(async (course_id, options = {}) => {
    const { silent = false } = options;

    try {
      if (!student_id) {
        localStorage.setItem("pendingCartCourseId", String(course_id));
        localStorage.setItem("postLoginRedirectPath", location.pathname);
        navigate("/login");
        return;
      }

      setAddingId(course_id);

      await axios.post("http://localhost:5500/cart/addtocart", {
        course_id,
        user_id: student_id,
      });

      localStorage.removeItem("pendingCartCourseId");
      localStorage.removeItem("postLoginRedirectPath");

      if (!silent) {
        alert("Added to Cart");
      }

      cartContext?.refreshCartCount?.();
      window.dispatchEvent(new Event("cart-updated"));
      setCartCourseIds((prev) =>
        prev.includes(course_id) ? prev : [...prev, course_id]
      );
    } catch (err) {
      console.error("Cart Error:", err.response?.data || err);

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

    handleAddToCart(Number(pendingCourseId));
  }, [handleAddToCart, student_id]);

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
          alert("Payment Successful");
          console.log("Payment ID:", response.razorpay_payment_id);

          try {
            const cartRes = await axios
              .get(`http://localhost:5500/cart/viewcart/${student_id}`)
              .catch(() =>
                axios.get(`http://localhost:5500/cart/viewcart?user_id=${student_id}`)
              );

            const cartItems = Array.isArray(cartRes?.data)
              ? cartRes.data
              : Array.isArray(cartRes?.data?.cart)
                ? cartRes.data.cart
                : Array.isArray(cartRes?.data?.data)
                  ? cartRes.data.data
                  : [];

            const existingCartItem = cartItems.find(
              (item) => Number(item.course_id) === courseId
            );

            if (existingCartItem?.cartid) {
              await axios.delete(`http://localhost:5500/cart/${existingCartItem.cartid}`);
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
    } catch (err) {
      console.error("Enroll payment error:", err);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">All Courses</h1>

      {loading && <p className="text-center text-gray-500">Loading courses...</p>}

      {error && <div className="text-center text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          courses.map((c) => {
            const coursePrice = getCoursePrice(c);
            const originalPrice = Number(
              c?.original_price ?? c?.originalPrice ?? c?.price ?? 0
            );
            const isPurchased = purchasedCourseIds.includes(Number(c.course_id));
            const isInCart = cartCourseIds.includes(Number(c.course_id));
            const imgUrl = getCourseImage(c);

            return (
              <div
                key={c.course_id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={imgUrl}
                    alt={c.course_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(c.course_name);
                    }}
                  />
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-lg font-bold">{c.course_name}</h3>

                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {c.description}
                  </p>

                  <div className="mb-4 text-sm text-gray-500">{c.duration}</div>

                  <div className="mb-4">
                    <div className="text-xl font-bold text-green-600">
                      Rs. {coursePrice}
                    </div>
                    {originalPrice > coursePrice && coursePrice > 0 && (
                      <div className="text-sm text-gray-400 line-through">
                        Rs. {originalPrice}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(c.course_id)}
                      disabled={
                        addingId === c.course_id || isPurchased || isInCart
                      }
                      className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                        addingId === c.course_id
                          ? "cursor-not-allowed bg-gray-400 text-white"
                          : isPurchased
                            ? "cursor-not-allowed bg-emerald-600 text-white"
                            : isInCart
                              ? "cursor-not-allowed bg-amber-500 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {addingId === c.course_id
                        ? "Adding..."
                        : isPurchased
                          ? "Purchased"
                          : isInCart
                            ? "Added"
                            : "Add to Cart"}
                    </button>

                    <button
                      onClick={() => handleEnroll(c)}
                      disabled={enrollingId === c.course_id || isPurchased}
                      className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-sm font-medium text-white transition hover:from-purple-700 hover:to-indigo-700"
                    >
                      {isPurchased
                        ? "Purchased"
                        : enrollingId === c.course_id
                          ? "Processing..."
                          : "Enroll Now"}
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
