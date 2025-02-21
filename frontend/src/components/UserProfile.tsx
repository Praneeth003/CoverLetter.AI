/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

export default function UserProfile() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Registration successful!");
      } else {
        setMessage("Registration failed: " + data.error);
      }
    } catch (error) {
      setMessage("Error during registration.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <br />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: "4px", width: "100%" }}
        />
      </div>
      <div style={{ marginTop: "8px" }}>
        <label>Password:</label>
        <br />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: "4px", width: "100%" }}
        />
      </div>
      <button type="submit" style={{ marginTop: "12px", padding: "8px 16px", cursor: "pointer" }}>
        Register
      </button>
      {message && <div style={{ marginTop: "8px" }}>{message}</div>}
    </form>
  );
}