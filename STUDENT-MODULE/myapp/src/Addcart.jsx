import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import {
  getCoursePrice,
  savePaymentHistoryToLocal,
  savePurchasedCoursesToLocal,
} from "./purchaseStorage";

export default function AddCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  const normalizeCartItems = (payload) => {
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

  const loadCart = useCallback(async () => {
    try {
      const student = JSON.parse(localStorage.getItem("student") || "null");
      const user_id = student?.student_id;

      if (!user_id) {
        setCart([]);
        cartContext?.setCartCount?.(0);
        return;
      }

      let cartItems = [];

      try {
        const res = await axios.get(
          `http://localhost:5500/cart/viewcart/${user_id}`
        );
        cartItems = normalizeCartItems(res.data);
      } catch (pathErr) {
        const res = await axios.get(
          `http://localhost:5500/cart/viewcart?user_id=${user_id}`
        );
        cartItems = normalizeCartItems(res.data);
      }

      setCart(cartItems);
      cartContext?.setCartCount?.(cartItems.length);
    } catch (err) {
      console.log("Load cart error:", err);
      setCart([]);
      cartContext?.setCartCount?.(0);
    }
  }, [cartContext]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const removeFromCart = async (cartid) => {
    try {
      await axios.delete(`http://localhost:5500/cart/${cartid}`);
      await loadCart();
      cartContext?.refreshCartCount?.();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.log(err);
    }
  };

  const getImage = (url) => {
    if (!url) return "https://via.placeholder.com/300x180";
    return `http://localhost:5500${url}`;
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + getCoursePrice(item),
    0
  );

  const checkoutHandler = useCallback(async () => {
    try {
      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      setLoading(true);

      const student = JSON.parse(localStorage.getItem("student") || "null");

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check index.html");
        return;
      }

      const options = {
        key: "rzp_test_S2wFC8cGw4pUpL",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Teach Hub",
        description: "Course Purchase",
        handler: async function (response) {
          alert("Payment Successful");
          console.log("Payment ID:", response.razorpay_payment_id);

          savePurchasedCoursesToLocal(student, cart);
          savePaymentHistoryToLocal(
            student,
            cart,
            response.razorpay_payment_id
          );

          await Promise.all(
            cart.map((item) =>
              axios.delete(`http://localhost:5500/cart/${item.cartid}`)
            )
          );

          await loadCart();
          await cartContext?.refreshCartCount?.();
          window.dispatchEvent(new Event("cart-updated"));
          window.dispatchEvent(new Event("purchase-updated"));
          navigate("/dashboard");
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
        },
        theme: {
          color: "#6D28D9",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log("Payment Error:", err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  }, [cart, cartContext, loadCart, navigate, totalAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500">
                Shopping Cart
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                My Cart
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {cart.length > 0
                  ? `${cart.length} course selected for checkout`
                  : "Add courses and they will appear here instantly."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Total Amount
              </p>
              <h3 className="mt-2 text-2xl font-bold">Rs. {totalAmount}</h3>
            </div>
          </div>
        </div>

        {cart.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800">
              Your cart is empty
            </h3>
            <p className="mt-3 text-slate-500">
              Jab aap course add karoge, woh yahan aur navbar dono me show hoga.
            </p>
          </div>
        )}

        {cart.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5">
              {cart.map((item) => {
                const itemPrice = getCoursePrice(item);
                const originalPrice = Number(
                  item?.original_price ?? item?.originalPrice ?? item?.price ?? 0
                );
                const hasDiscount =
                  Number.isFinite(originalPrice) &&
                  originalPrice > itemPrice &&
                  itemPrice > 0;

                return (
                  <div
                    key={item.cartid || item.id || item.course_id}
                    className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={getImage(item.image_url)}
                        alt={item.course_name || item.title}
                        className="h-24 w-36 rounded-2xl object-cover"
                      />

                      <div className="flex-1">
                        <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                          Premium Course
                        </span>
                        <h3 className="mt-3 text-xl font-bold text-slate-900">
                          {item.course_name || item.title || "Course"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          Lifetime access, curated content, and practical learning.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-600">
                          Rs. {itemPrice}
                        </p>
                        {hasDiscount && (
                          <p className="text-sm text-slate-400 line-through">
                            Rs. {originalPrice}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartid)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                Order Summary
              </h3>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Courses</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access</span>
                  <span>Lifetime</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>

              <div className="my-6 h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-700">
                  Total
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  Rs. {totalAmount}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
