import { useState } from "react";
import { authRequest } from "../api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../assets/svg";
import Threads from "../components/Threads";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Must be at least 8 characters.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await authRequest("auth/signup", { username, password });
      navigate("/login");
    } catch (err) {
      setServerError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark text-white overflow-hidden flex flex-col">

      {/* Background animation */}
      <div className="fixed inset-0 z-0 opacity-50">
        <Threads amplitude={3} distance={0} enableMouseInteraction={false} color={[1, 0.8, 0]} />
      </div>

      {/* Radial glow */}
      <div
        className="pointer-events-none fixed z-0 top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(80vw, 600px)",
          height: "min(80vw, 600px)",
          background: "radial-gradient(ellipse at 50% 0%, rgba(253,206,0,0.11) 0%, transparent 65%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 w-full px-6 py-5 sm:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} aria-label="Back to home">
            <Logo className="h-auto w-14 sm:w-16 opacity-90 hover:opacity-100 transition" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Create account</h1>
            <p className="text-sm text-white/40">Start getting things done today.</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Username */}
            <div>
              <label className="form-label-dark">Username</label>
              <input
                type="text"
                className={`input-dark ${errors.username ? "border-red-500/50 bg-red-500/5" : ""}`}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((p) => ({ ...p, username: "" }));
                }}
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label-dark">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input-dark pr-11 ${errors.password ? "border-red-500/50 bg-red-500/5" : ""}`}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label-dark">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className={`input-dark ${errors.confirmPassword ? "border-red-500/50 bg-red-500/5" : ""}`}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-1">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-brand-yellow font-semibold hover:brightness-110 transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
