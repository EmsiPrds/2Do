import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "../api";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../assets/svg";
import Threads from "../components/Threads";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authRequest("auth/login", { username, password });
      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-lm-bg dark:bg-brand-dark text-lm-text1 dark:text-white overflow-hidden flex flex-col transition-colors duration-300">

      {/* Background animation */}
      <div className="fixed inset-0 z-0 opacity-30 dark:opacity-50">
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm transition duration-200
                         text-lm-text2 dark:text-white/50 hover:text-lm-text1 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-lm-text1 dark:text-white">Welcome back</h1>
            <p className="text-sm text-lm-text2 dark:text-white/40">Sign in to continue to 2Do.</p>
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
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 transition
                             text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="pt-1">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-lm-text2 dark:text-white/40">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-brand-yellow font-semibold hover:brightness-110 transition"
            >
              Sign up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
