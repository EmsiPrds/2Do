import AuthForm from "../components/AuthForm";
import { authRequest } from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = async ({ username, password }) => {
    try {
      await authRequest("auth/signup", { username, password });
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return <AuthForm type="signup" onSubmit={handleSignup} />;
}
