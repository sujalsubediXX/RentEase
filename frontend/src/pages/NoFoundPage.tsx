import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Reveal } from "../config/MotionFunction.tsx";
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full"></div>

          <Reveal delay={(1 % 3) * 0.1} className="relative">
            <h1 className="text-[120px] sm:text-[160px] font-black text-white leading-none tracking-tight">
              404
            </h1>
          </Reveal>
        </div>
        <Reveal className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Page Not Found
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            The page you are looking for doesn&apos;t exist or may have been
            moved to another location.
          </p>
        </Reveal>

        <Reveal delay={(2 % 3) * 0.1} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </Reveal>

        <div className="mt-14">
          <Reveal delay={(3 % 3) * 0.1}>
            <p className="text-sm text-slate-500">
              Error Code: 404 | Resource Not Found
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;