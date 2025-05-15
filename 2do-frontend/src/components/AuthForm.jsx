import { useState } from "react";
import { Link } from "react-router-dom";

export default function AuthForm({ type = "login", onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 bg-white p-8 rounded shadow space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-primary mb-4">
        {type === "login" ? "Login to 2Do" : "Create an Account"}
      </h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
      >
        {type === "login" ? "Login" : "Signup"}
      </button>

      <p className="text-center text-sm text-secondary mt-4">
        {type === "login" ? (
          <>
            Don’t have an account?{" "}
            <Link to="/signup" className="text-primary underline">
              Sign up here
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline">
              Login here
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
