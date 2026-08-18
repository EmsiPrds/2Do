import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, LayoutList, ArrowRight } from "lucide-react";
import Logo from "../assets/svg";
import Threads from "../components/Threads";

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm
                    hover:bg-white/8 hover:border-white/20 transition duration-300">
      <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand-yellow" strokeWidth={2} />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-sm text-white/50 leading-relaxed">{body}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: LayoutList,
    title: "Capture everything",
    body: "Add tasks in seconds with a title, description, and due date. Nothing slips through the cracks.",
  },
  {
    icon: CheckCircle2,
    title: "Stay on track",
    body: "Filter by status, sort by date, and watch your pending list shrink day by day.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "A focused, distraction-free interface designed to keep you moving — not thinking.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-brand-dark text-white overflow-x-hidden flex flex-col">

      {/* ── Animated background ── */}
      <div className="fixed inset-0 z-0 opacity-55">
        <Threads
          amplitude={3}
          distance={0}
          enableMouseInteraction={true}
          color={[1, 0.8, 0]}
        />
      </div>

      {/* Radial glow */}
      <div
        className="pointer-events-none fixed z-0 top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vw, 700px)",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(253,206,0,0.13) 0%, transparent 65%)",
        }}
      />

      {/* ════════════ NAV ════════════ */}
      <nav className="relative z-10 w-full px-6 py-5 sm:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo className="h-auto w-16 sm:w-20 opacity-95" />

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-white/60 hover:text-white transition duration-200"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-yellow
                         text-brand-dark text-sm font-semibold transition duration-200 hover:brightness-105 active:scale-[0.98]"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center
                          text-center px-6 sm:px-10 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-white/5 border border-white/10 text-xs text-white/50 mb-8 sm:mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse shrink-0" />
            Simple. Focused. Yours.
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                         font-bold leading-[1.1] tracking-tight mb-5 sm:mb-6">
            Turn your{" "}
            <span className="text-brand-yellow">to-do&apos;s</span>
            <br className="hidden xs:block" />
            {" "}into{" "}
            <span className="text-brand-yellow">done.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base text-white/50 leading-relaxed
                        max-w-sm sm:max-w-md mb-10 sm:mb-12">
            A clean, minimal task manager built around your focus —
            not around features you&apos;ll never use.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm sm:max-w-none sm:justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="group w-full sm:w-auto flex items-center justify-center gap-2
                         px-8 py-4 rounded-xl bg-brand-yellow text-brand-dark font-semibold text-sm
                         transition-all duration-200 hover:brightness-105 active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
            >
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/15
                         text-white/60 font-medium text-sm
                         transition duration-200 hover:border-white/35 hover:text-white active:scale-[0.98]"
            >
              I already have an account
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto">

          {/* Divider */}
          <div className="w-full h-px bg-white/8 mb-12 sm:mb-16" />

          <p className="text-xs font-semibold uppercase tracking-widest text-white/25
                        text-center mb-8 sm:mb-10">
            Why 2Do
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="relative z-10 px-6 pb-8 text-center">
        <p className="text-xs text-white/20">
          &copy; {new Date().getFullYear()} 2Do. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
