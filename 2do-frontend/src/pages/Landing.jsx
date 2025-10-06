import { useNavigate } from "react-router-dom";
import Logo from "../assets/svg";
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

      <header className="absolute -translate-x-1/2 top-10 left-1/2 ">
        <Logo className="h-auto w-24" />
      </header>
      {/* Main Content */}
      <h1 className="mb-4 text-4xl font-bold text-center md:text-5xl">
        Turn <span className="text-brand-yellow">To-Do's</span> into{" "}
        <span className="text-brand-yellow">Done!</span>
      </h1>
      <p className="max-w-lg mb-8 text-lg text-center">
        You don't just plan - you{" "}
        <span className="text-brand-yellow">Make It Happen.</span> Organize
        beautifully, focus clearly, and achieve more.
      </p>
      <div className="flex flex-col gap-4 lg:flex-row">
        <button
          onClick={() => navigate("/login")}
          className="px-32 py-1 font-semibold transition border rounded-full lg:px-16 border-brand-light text-brand-light hover:brightness-110"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-32 py-1 font-semibold transition border rounded-full lg:px-16 border-brand-yellow text-brand-yellow hover:brightness-110"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
