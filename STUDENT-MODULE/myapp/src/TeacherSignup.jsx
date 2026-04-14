import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { extractTeacherAuthPayload, saveTeacherProfile } from "./teacherDataStorage";

export default function TeacherSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    qualification: "",
    specialization: "",
    bio: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5500/teacher/signup",
        formData
      );

      const { token, teacher } = extractTeacherAuthPayload(res.data);

      if (!token) {
        throw new Error("Missing teacher token in signup response.");
      }

      localStorage.setItem("teacherToken", token);

      if (teacher?.id) {
        localStorage.setItem("teacherId", teacher.id);
      }

      if (teacher) {
        saveTeacherProfile(teacher);
      }

      navigate("/teacher/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || err.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Teacher Signup
        </h2>

        <input name="id" placeholder="Teacher ID" onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 mb-2 rounded" required />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-2 mb-2 rounded" />
        <input name="qualification" placeholder="Qualification" onChange={handleChange} className="w-full border p-2 mb-2 rounded" />
        <input name="specialization" placeholder="Specialization" onChange={handleChange} className="w-full border p-2 mb-2 rounded" />
        <textarea name="bio" placeholder="Bio" onChange={handleChange} className="w-full border p-2 mb-2 rounded" />

        <button className="w-full bg-purple-600 text-white py-2 rounded mt-4">
          Signup
        </button>

        {/* Login Link  */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-purple-600 cursor-pointer font-semibold"
            onClick={() => navigate("/teacher/login")}
          >
            Login here
          </span>
        </p>

      </form>
    </div>
  );
}
