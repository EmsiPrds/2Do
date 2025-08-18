import { useNavigate } from "react-router-dom";
import Threads from "../components/Threads";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 text-brand-light">
      {/* Background Threads Component */}
      <div
        className="bg-brand-dark"
        style={{
          position: "absolute", // Position it behind the content
          top: 0,
          left: 0,
          width: "100vw",
          height: "100%", // Full screen height
          zIndex: -1, // Ensure it stays in the background
        }}
      >
        <Threads amplitude={5} distance={0} enableMouseInteraction={true} />
      </div>

      {/* Main Content */}
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
        Welcome to <span className="text-brand-yellow">2Do</span> App
      </h1>
      <p className="max-w-md mb-8 text-lg text-center">
        Stay organized and manage your tasks effortlessly with a modern and
        clean interface.
      </p>
      <div className="flex flex-col gap-4 lg:flex-row">
        <button
          onClick={() => navigate("/login")}
          className="px-32 py-2 font-semibold transition rounded-full lg:px-10 bg-brand-yellow text-brand-dark hover:brightness-110"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-32 py-2 font-semibold transition border-2 rounded-full lg:px-6 border-brand-yellow text-brand-light hover:bg-brand-yellow hover:text-brand-dark"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
