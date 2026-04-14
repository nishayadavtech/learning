import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setLoading(false);
  }, []);

  const removeFromCart = (courseId) => {
    const updatedCart = cart.filter((item) => item.course_id !== courseId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (courseId, qty) => {
    if (qty <= 0) {
      removeFromCart(courseId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.course_id === courseId ? { ...item, quantity: qty } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  };

  const getOriginalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalSavings = () => {
    return getOriginalPrice() - getTotalPrice();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">🛒 Shopping Cart</h2>

      {loading ? (
        <p>Loading…</p>
      ) : cart.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <p className="mb-3">Your cart is empty</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/courses")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items */}
          <div className="col-md-8">
            {cart.map((item) => (
              <div
                key={item.course_id}
                className="card mb-3 shadow-sm"
              >
                <div className="row g-0">
                  {/* Image */}
                  <div className="col-md-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.course_name}
                        className="img-fluid rounded-start h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="bg-secondary text-white d-flex align-items-center justify-content-center h-100">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="col-md-9">
                    <div className="card-body">
                      <h5 className="card-title">{item.course_name}</h5>

                      {/* Price */}
                      <p className="mb-2">
                        <span className="text-danger fw-bold" style={{ fontSize: "18px" }}>
                          ₹{item.discount_price.toLocaleString()}
                        </span>
                        <span className="text-muted ms-2" style={{ textDecoration: "line-through" }}>
                          ₹{item.price.toLocaleString()}
                        </span>
                      </p>

                      {/* Quantity */}
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <label>Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.course_id,
                              parseInt(e.target.value)
                            )
                          }
                          className="form-control"
                          style={{ width: "60px" }}
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(item.course_id)}
                      >
                       Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="col-md-4">
            <div className="card p-4 shadow-sm sticky-top" style={{ top: "20px" }}>
              <h5 className="fw-bold mb-3">Order Summary</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{getOriginalPrice().toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-success">
                  <span>Discount:</span>
                  <span>-₹{getTotalSavings().toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold" style={{ fontSize: "18px" }}>
                  <span>Total:</span>
                  <span className="text-primary">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <button className="btn btn-success w-100 fw-bold py-2 mb-2">
                💳 Proceed to Checkout
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate("/courses")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

