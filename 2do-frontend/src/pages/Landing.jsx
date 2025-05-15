import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-4">Welcome to 2Do!</h1>
      <p className="text-secondary mb-8">
        Your personal task manager, simple and effective.
      </p>
      <div className="flex gap-4">
        <Link to="/signup">
          <button className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600">
            Get Started
          </button>
        </Link>
        <Link to="/login">
          <button className="border border-primary text-primary px-6 py-2 rounded hover:bg-primary hover:text-white transition">
            I Have an Account
          </button>
        </Link>
      </div>
    </div>
  );
}
