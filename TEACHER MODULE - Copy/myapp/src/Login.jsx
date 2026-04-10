import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { InputGroup, Button, Spinner } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail } from "react-icons/ai";
import "bootstrap/dist/css/bootstrap.min.css";
import { saveAuthSession } from "./auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill both fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5500/teacher/login", {
        email,
        password,
      });

      const user =
        res.data.teacher || res.data.user || res.data.admin || res.data.student;

      saveAuthSession({
        token: res.data.token,
        user,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="teacher-login-page min-vh-100 d-flex align-items-center justify-content-center px-3 py-4"
      >
        <div className="teacher-login-shell">
          <div className="teacher-login-card">
            <div className="teacher-login-header text-center">
              <span className="teacher-login-badge">Teacher Module</span>
              <h3>Teacher Login</h3>
              <p>Login to access your dashboard.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label teacher-login-label">Email</label>
                <InputGroup className="teacher-input-group">
                  <InputGroup.Text className="teacher-input-icon">
                    <AiOutlineMail />
                  </InputGroup.Text>
                  <input
                    type="email"
                    className="form-control teacher-login-input"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="mb-3">
                <label className="form-label teacher-login-label">Password</label>
                <InputGroup className="teacher-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control teacher-login-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    className="teacher-password-toggle"
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </Button>
                </InputGroup>
              </div>

              {error && (
                <div className="alert alert-danger teacher-login-alert" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn teacher-login-button w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="teacher-signup-box text-center mt-3">
              <p className="mb-0">
                Don't have an account?{" "}
                <Link to="/signup" className="teacher-signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .teacher-login-page {
            background:
              radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 28%),
              radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.08), transparent 30%),
              linear-gradient(135deg, #f4f8fc 0%, #eef4fb 100%);
          }

          .teacher-login-shell {
            width: min(420px, 100%);
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 22px 52px rgba(15, 23, 42, 0.12);
            border: 1px solid rgba(148, 163, 184, 0.14);
          }

          .teacher-login-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 7px 12px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #0369a1;
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .teacher-login-card {
            margin: 0 auto;
            padding: 32px 26px;
          }

          .teacher-login-header h3 {
            margin: 14px 0 8px;
            color: #0f172a;
            font-size: 1.7rem;
            font-weight: 700;
          }

          .teacher-login-header p {
            margin: 0 0 22px;
            color: #64748b;
            font-size: 0.92rem;
          }

          .teacher-login-label {
            color: #334155;
            font-size: 0.88rem;
            font-weight: 600;
            margin-bottom: 7px;
          }

          .teacher-input-group {
            border: 1px solid #dbe4ee;
            border-radius: 14px;
            overflow: hidden;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .teacher-input-group:focus-within {
            border-color: #0ea5e9;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
          }

          .teacher-input-icon,
          .teacher-password-toggle {
            border: none !important;
            background: #f8fbff !important;
            color: #64748b !important;
          }

          .teacher-login-input {
            border: none !important;
            padding: 12px 14px;
            font-size: 0.94rem;
            box-shadow: none !important;
          }

          .teacher-login-button {
            height: 48px;
            border: none;
            border-radius: 14px;
            background: linear-gradient(135deg, #0284c7 0%, #0f766e 100%);
            color: #ffffff;
            font-size: 0.95rem;
            font-weight: 700;
            box-shadow: 0 14px 28px rgba(2, 132, 199, 0.18);
          }

          .teacher-login-button:hover,
          .teacher-login-button:focus {
            color: #ffffff;
            background: linear-gradient(135deg, #0369a1 0%, #115e59 100%);
          }

          .teacher-login-button:disabled {
            opacity: 0.8;
          }

          .teacher-login-alert {
            border-radius: 14px;
            margin-bottom: 14px;
            padding: 10px 12px;
            font-size: 0.9rem;
          }

          .teacher-signup-box {
            color: #64748b;
            font-size: 0.92rem;
          }

          .teacher-signup-link {
            color: #0284c7;
            text-decoration: none;
            font-weight: 700;
          }

          .teacher-signup-link:hover {
            color: #0369a1;
          }

          @media (max-width: 575px) {
            .teacher-login-page {
              padding-left: 12px !important;
              padding-right: 12px !important;
            }

            .teacher-login-shell {
              border-radius: 20px;
            }

            .teacher-login-card {
              padding: 24px 18px;
            }

            .teacher-login-header h3 {
              font-size: 1.45rem;
            }
          }
        `}
      </style>
    </>
  );
}
