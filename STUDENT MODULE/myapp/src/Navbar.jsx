import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineSearch, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FaGlobe, FaShoppingCart } from "react-icons/fa";
import { CartContext } from "./CartContext";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showExplore, setShowExplore] = useState(false);
  const [showCartPulse, setShowCartPulse] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const context = useContext(CartContext);
  const cartCount = context?.cartCount || 0;

  const teacherToken = localStorage.getItem("teacherToken");
  const student = JSON.parse(localStorage.getItem("student") || "null");
  const isStudentLoggedIn = !!student;
  const user_id = student?.student_id;
  const refreshCartCount = context?.refreshCartCount;
  const setCartCount = context?.setCartCount;

  useEffect(() => {
    if (cartCount <= 0) {
      return;
    }

    setShowCartPulse(true);

    const timer = setTimeout(() => {
      setShowCartPulse(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [cartCount]);

  useEffect(() => {
    if (!user_id) {
      setCartCount?.(0);
      return;
    }

    refreshCartCount?.();
  }, [refreshCartCount, setCartCount, user_id]);

  const handleStudentLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("studentToken");
    localStorage.removeItem("postLoginRedirectPath");
    localStorage.removeItem("pendingCartCourseId");
    setCartCount?.(0);
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleTeacherLogout = () => {
    localStorage.removeItem("teacherToken");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5500/course/search?search=${encodeURIComponent(
          value
        )}`
      );
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openCourse = (id) => {
    navigate(`/student/course/${id}`);
    setQuery("");
    setResults([]);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:gap-6 md:px-6">
        {/* Logo and Menu Toggle */}
        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {isMobileMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </button>
          <Link
            to="/"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-xl font-extrabold tracking-wide text-transparent md:text-2xl"
          >
            TeachHub
          </Link>

          <div className="relative hidden md:block">
            <button
              onClick={() => setShowExplore(!showExplore)}
              className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
            >
              Explore
            </button>

            {showExplore && (
              <div className="absolute left-0 top-10 w-48 rounded-md border bg-white p-3 shadow-lg">
                <p
                  onClick={() => { navigate("/category/development"); setShowExplore(false); }}
                  className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                >
                  Development
                </p>
                <p
                  onClick={() => { navigate("/category/design"); setShowExplore(false); }}
                  className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                >
                  Design
                </p>
                <p
                  onClick={() => { navigate("/category/business"); setShowExplore(false); }}
                  className="cursor-pointer rounded p-2 text-sm hover:bg-gray-100"
                >
                  Business
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 md:max-w-2xl">
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 md:left-5" />

          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 md:py-3 md:pl-12 md:pr-5 md:text-base"
          />

          {results.length > 0 && (
            <div className="absolute left-0 top-full mt-2 max-h-72 w-full overflow-y-auto rounded-xl border bg-white shadow-xl">
              {results.map((item) => (
                <div
                  key={item.course_id}
                  onClick={() => openCourse(item.course_id)}
                  className="flex cursor-pointer items-center gap-4 p-3 hover:bg-gray-50"
                >
                  {item.image_url && (
                    <img
                      src={`http://localhost:5500${item.image_url}`}
                      alt={item.course_name}
                      className="h-10 w-10 rounded-md object-cover md:h-14 md:w-14"
                    />
                  )}

                  <div>
                    <p className="text-sm font-semibold">{item.course_name}</p>
                    <p className="line-clamp-1 text-xs text-gray-500 md:line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Icons & Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/addcart"
            className={`relative rounded-full p-2 transition hover:bg-violet-50 ${
              showCartPulse ? "scale-110 bg-violet-50" : ""
            }`}
          >
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1 text-xs text-white transition ${
                  showCartPulse ? "animate-pulse shadow-lg shadow-purple-200" : ""
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            {!isStudentLoggedIn && (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                  Signup
                </Link>
              </>
            )}

            {isStudentLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleStudentLogout}
                  className="rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}

            {teacherToken && (
              <button
                onClick={handleTeacherLogout}
                className="rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                Teacher Logout
              </button>
            )}
          </div>

          <button className="hidden rounded-md border border-gray-300 p-2 transition hover:bg-gray-100 sm:block">
            <FaGlobe />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              to="/teacher/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Teach on TeachHub
            </Link>
            
            <hr className="border-gray-100" />

            {!isStudentLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-md border border-gray-300 py-2 text-center text-sm font-medium"
                >
                  Student Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-md bg-purple-600 py-2 text-center text-sm font-medium text-white"
                >
                  Student Signup
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-md border border-violet-200 py-2 text-center text-sm font-medium text-violet-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleStudentLogout}
                  className="w-full rounded-md border border-red-400 py-2 text-sm font-medium text-red-500"
                >
                  Logout
                </button>
              </div>
            )}

            {teacherToken && (
              <button
                onClick={handleTeacherLogout}
                className="w-full rounded-md border border-blue-500 py-2 text-sm font-medium text-blue-600"
              >
                Teacher Logout
              </button>
            ) }
          </div>
        </div>
      )}
    </nav>
  );
}
