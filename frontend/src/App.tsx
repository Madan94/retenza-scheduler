import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateTemplate from "./pages/CreateTemplate";
import CreateSchedule from "./pages/CreateSchedule";

// Header component using useLocation to render beautiful active states
function Navigation() {
  const location = useLocation();

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
          {/* Custom stylized white R matching the brand logo squircle */}
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 3h6.5a4.5 4.5 0 0 1 4.5 4.5c0 1.95-1.24 3.6-3 4.22L19 21h-3.8l-4.5-8H8v8H5V3zm3 3v4h3.5a1.5 1.5 0 0 0 0-3H9z" />
          </svg>
        </div>
        <span className="font-bold text-xl text-slate-900 tracking-tight font-sans">Retenza</span>
      </Link>

      {/* Navigation tabs - inspired by the pill structure in the screenshot */}
      <nav className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl">
        <Link
          to="/"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isLinkActive("/")
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
            }`}
        >
          Dashboard
        </Link>
        <Link
          to="/template"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isLinkActive("/template")
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
            }`}
        >
          Templates
        </Link>
        <Link
          to="/schedule"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isLinkActive("/schedule")
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
            }`}
        >
          Schedules
        </Link>
      </nav>

      {/* Header Right - Premium Badge */}
      <div className="flex items-center gap-3">
        <a
          href="https:retenza.in"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-brand-gold border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-gold"></span>
          </span>
          Connect with us
        </a>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Navigation />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/template" element={<CreateTemplate />} />
            <Route path="/schedule" element={<CreateSchedule />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;