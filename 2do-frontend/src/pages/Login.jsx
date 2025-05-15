import AuthForm from "../components/AuthForm";
import { authRequest } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async ({ username, password }) => {
    try {
      const result = await authRequest("auth/login", { username, password });
      localStorage.setItem("token", result.token);
      alert("Login successful!");
      navigate("/dashboard"); // ✅ Redirect to Dashboard after successful login
    } catch (err) {
      alert(err.message);
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
