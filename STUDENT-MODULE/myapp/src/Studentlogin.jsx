import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5500/student/login", form);

      localStorage.setItem("student", JSON.stringify(res.data.student));
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("purchase-updated"));

      const redirectPath = localStorage.getItem("postLoginRedirectPath");
      localStorage.removeItem("postLoginRedirectPath");

      alert("Login Successful");
      navigate(redirectPath || "/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#fef3c7,_#ffffff_40%,_#e0f2fe_100%)] px-4">
      
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:grid-cols-[1fr_1fr]">
        
        {/* IMAGE SIDE */}
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Students"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.85))]" />
        </div>

        {/* FORM SIDE */}
        <div className="flex items-center justify-center px-5 py-6 sm:px-6">
          <div className="w-full max-w-xs">

            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600">
                TeachHub
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Student Login
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Access your courses and dashboard easily.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow">
                Login
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-violet-600 hover:underline"
              >
                Signup
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
