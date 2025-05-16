import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center text-brand-dark px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
        Welcome to <span className="text-brand-yellow">2Do</span> App
      </h1>
      <p className="text-center text-lg mb-8 max-w-md">
        Stay organized and manage your tasks effortlessly with a modern and
        clean interface.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-brand-yellow text-brand-dark font-semibold rounded hover:brightness-110 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 border-2 border-brand-yellow text-brand-dark font-semibold rounded hover:bg-brand-yellow hover:text-brand-dark transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
