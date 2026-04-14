import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { CartProvider } from "./CartContext";

/* COMPONENTS */
import Navbar from "./Navbar";
import Login from "./Studentlogin";
import Signup from "./Studentsignup";
import StudentHome from "./StudentHome";
import StudentCourseSearch from "./StudentCourseSearch";
import Coursedetail from "./Coursedetail";
import Addcart from "./Addcart";

import TeacherLogin from "./TeacherLogin";
import TeacherSignup from "./TeacherSignup";
import TeacherLayout from "./TeacherLayout";
import Teacherdashboard from "./Teacherdashboard";
import Teachercourse from "./Teachercourse";
import TeacherSyllabus from "./TeacherSyllabus";
import Teacherpubliccourse from "./Teacherpubliccourse";

import Homepage1 from "./Homepage1";
import Course2 from "./Course2";
import Skillssection from "./Skillssection";
import TrustedCompanies from "./TrustedCompanies";
import Lastpart from "./Lastpart";
import Trendingcourse from "./Trendingcourse";
import Footer from "./Footer";
import Uploadecourse from "./Uploadecourse";
import Studentdashboard from "./Studentdashboard";

/* ================= PROTECTED ROUTES ================= */

// Student Protected
const StudentProtected = ({ children }) => {
  const student = localStorage.getItem("student");
  if (student) {
    return children;
  }

  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;
  localStorage.setItem("postLoginRedirectPath", currentPath || "/dashboard");

  return <Navigate to="/login" replace />;
};

// Teacher Protected
const TeacherProtected = ({ children }) => {
  const teacher = localStorage.getItem("teacherToken");
  return teacher ? children : <Navigate to="/teacher/login" replace />;
};

/* ================= MAIN CONTENT ================= */

function AppContent() {
  const location = useLocation();

  // Hide Navbar on teacher panel
  const hideNavbar = location.pathname.startsWith("/teacher");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className="font-sans bg-white text-gray-900 min-h-screen">
        <Routes>
          {/* ================= HOME ================= */}
          <Route
            path="/"
            element={
              <>
                <Homepage1 />
                <Course2 />
                <Teacherpubliccourse />
                <Skillssection />
                <TrustedCompanies />
                <Lastpart />
                <Trendingcourse />
                <Uploadecourse />
                <Footer />
              </>
            }
          />

          {/* ================= STUDENT ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/search" element={<StudentCourseSearch />} />
          <Route path="/student/course/:id" element={<Coursedetail />} />

          <Route
            path="/student/dashboard"
            element={
              <StudentProtected>
                <div className="p-6 text-xl font-bold">
                  🎓 Student Dashboard
                </div>
              </StudentProtected>
            }
          />
          <Route
            path="/dashboard"
            element={
              <StudentProtected>
                <Studentdashboard />
              </StudentProtected>
            }
          />
          {/* ================= CART ================= */}
          <Route
            path="/addcart"
            element={
              <StudentProtected>
                <Addcart />
              </StudentProtected>
            }
          />

          {/* ================= TEACHER AUTH ================= */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/signup" element={<TeacherSignup />} />

          {/* ================= TEACHER PANEL ================= */}
          <Route
            path="/teacher"
            element={
              <TeacherProtected>
                <TeacherLayout />
              </TeacherProtected>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Teacherdashboard />} />
            <Route path="courses" element={<Teachercourse />} />
            <Route path="syllabus" element={<TeacherSyllabus />} />
            <Route path="course/:id" element={<Coursedetail />} />
          </Route>

          {/* ================= 404 ================= */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-2xl">Page Not Found</div>
            }
          />
        </Routes>
      </div>
    </>
  );
}

/* ================= APP ROOT ================= */

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
