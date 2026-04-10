import React, { useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { getAuthToken, getUserRole } from "./auth";

export default function ChangePassword({ show, onHide }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const role = getUserRole();

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("All fields are required");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }
    if (role !== "teacher") {
      setMessage("Change password is currently enabled for teacher login only");
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await axios.post(
        "http://localhost:5500/teacher/changepassword",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage(res.data.message);
      if (res.data.success) {
        setTimeout(() => {
          setMessage("");
          onHide();
        }, 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <p
            style={{
              color: message.includes("success") ? "green" : "red",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              className="form-control"
              value={form.oldPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
