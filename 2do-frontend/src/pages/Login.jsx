import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "../api";
import {ArrowLeft} from "lucide-react";

// Login Accout:
// Username: cent
// Password: Password123!

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await authRequest("auth/login", { username, password });
      localStorage.setItem("token", result.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Login failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-primary">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 space-y-4 bg-white rounded shadow-md"
      >
        <div>
          <ArrowLeft
            className="w-6 h-6 text-brand-dark cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-brand-dark">
          Login
        </h2>

        <div>
          <label className="block mb-1 text-sm text-brand-dark">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm text-brand-dark">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 pr-10 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-sm transform -translate-y-1/2 top-1/2 right-2 text-brand-dark"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 font-semibold transition rounded bg-brand-yellow text-brand-dark hover:brightness-110"
        >
          Login
        </button>

        <p className="text-sm text-center text-brand-dark">
          Don't have an account?{" "}
          <span
            className="underline cursor-pointer text-brand-yellow"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
