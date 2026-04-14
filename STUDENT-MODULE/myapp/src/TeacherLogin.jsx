import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { extractTeacherAuthPayload, saveTeacherProfile } from "./teacherDataStorage";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (token) {
      navigate("/teacher/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5500/teacher/login", {
        email,
        password,
      });

      const { token, teacher } = extractTeacherAuthPayload(res.data);

      if (!token) {
        throw new Error("Missing teacher token in login response.");
      }

      localStorage.setItem("teacherToken", token);

      if (teacher?.id) {
        localStorage.setItem("teacherId", teacher.id);
      }

      if (teacher) {
        saveTeacherProfile(teacher);
      }

      navigate("/teacher/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login Failed";
      alert(message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#f5f3ff_100%)] px-4">
      
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:grid-cols-[1fr_1fr]">

        {/* LEFT SIDE */}
        <div className="flex items-center justify-center px-5 py-6 sm:px-6">
          <div className="w-full max-w-xs">

            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">
                Instructor Portal
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Teacher Login
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Manage your teaching dashboard easily.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow"
              >
                Login
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/teacher/signup")}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Sign up
              </button>
            </p>

          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            alt="Teacher"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,41,59,0.2),rgba(15,23,42,0.85))]" />
        </div>

      </div>
    </div>
  );
}
