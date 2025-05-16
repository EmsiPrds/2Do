import { useState } from "react";
import { authRequest } from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await authRequest("auth/signup", { username, password });
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-brand-dark">
          Sign Up
        </h2>

        <div>
          <label className="block text-sm mb-1 text-brand-dark">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-1">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-brand-dark">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-sm text-brand-dark"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-brand-dark">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-brand-yellow text-brand-dark py-2 rounded font-semibold hover:brightness-110 transition"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-brand-dark">
          Already have an account?{" "}
          <span
            className="text-brand-yellow underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
