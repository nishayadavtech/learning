import React, { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const student = JSON.parse(localStorage.getItem("student") || "null");
    const user_id = student?.student_id;

    if (!user_id) {
      setCartCount(0);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5500/cart/viewcart/${user_id}`
      );
      setCartCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.log("Cart count error:", err);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();

    const handleCartUpdated = () => {
      refreshCartCount();
    };

    window.addEventListener("storage", handleCartUpdated);
    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleCartUpdated);
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [refreshCartCount]);

  const addToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = [...existingCart, item];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.length);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeFromCart = (id) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = existingCart.filter((item) => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.length);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartCount(0);
    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        refreshCartCount,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
