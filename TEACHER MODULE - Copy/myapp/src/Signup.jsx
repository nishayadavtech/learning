import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Signup() {
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
    image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle file input
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5500/teacher/signup",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.message === "Teacher registered successfully") {
        setSuccess("Signup successful! Redirecting...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "28rem" }}>
        <h3 className="text-center mb-3">Teacher Signup</h3>

        <form onSubmit={handleSubmit}>
          {/* ID + Name */}
          <div className="mb-3 d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Teacher ID"
              name="id"
              value={formData.id}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <InputGroup>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </Button>
            </InputGroup>
          </div>

          {/* Phone */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Qualification + Specialization */}
          <div className="mb-3 d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div className="mb-3">
            <textarea
              className="form-control"
              placeholder="Short Bio"
              rows={2}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Image */}
          <div className="mb-3">
            <Form.Group controlId="formFile">
              <Form.Label>Upload Profile Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Form.Group>
          </div>

          {/* Button */}
          <Button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          {/* Message */}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </form>

        {/* Login link */}
        <div className="text-center mt-3">
          <p className="mb-0">
            Already have an account?{" "}
            <Link to="/" className="text-primary fw-bold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
